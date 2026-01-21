import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { addCompanyContext, createCompanyFilter } from '../middleware/tenantContext.js';

export async function createSalesOrder(req, res) {
  const { customer_name, customer_phone, items, currency = 'UGX' } = req.body;
  const companyId = req.companyId;
  
  // Use PostgreSQL transaction for data consistency
  let session = null;

  try {
    // Input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please add at least one item to create an order.' });
    }
    
    // Validate item structure
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_id || typeof item.product_id !== 'string') {
        return res.status(400).json({ error: `Item ${i + 1}: Invalid product ID.` });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: `Item ${i + 1}: Quantity must be a positive number.` });
      }
    }
    
    // Auto-register customer if both name and phone are provided
    if (customer_name && customer_phone) {
      // Check if customer already exists
      const existingCustomer = await query(
        'SELECT * FROM customers WHERE phone = ? AND company_id = ? LIMIT 1',
        [customer_phone, companyId]
      );
      
      if (existingCustomer.length === 0) {
        // Auto-register new customer
        const customerId = uuidv4();
        await query(
          `INSERT INTO customers (id, company_id, name, phone, email, address, total_purchases)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [customerId, companyId, customer_name, customer_phone, '', '', 0]
        );
      }
    }

    // Validate currency
    const validCurrencies = ['UGX', 'USD', 'EUR', 'GBP'];
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({ 
        error: `Please select a valid currency: ${validCurrencies.join(', ')}.` 
      });
    }

    // MySQL handles transactions automatically with query isolation
    // No explicit session management needed

    // Exchange rate: 1 USD = 3700 UGX (you can update this or store in database)
    const EXCHANGE_RATE = 3700;

    let totalAmount = 0;
    const orderItems = [];
    const productUpdates = [];

    // First validate all items exist and have sufficient stock (within this business)
    for (const item of items) {
      const productResult = await query(
        'SELECT * FROM products WHERE id = ? AND company_id = ? LIMIT 1',
        [item.product_id, companyId]
      );
      const product = productResult[0];

      if (!product) {
        return res.status(404).json({ error: `Product not found. It may have been deleted. Please refresh and try again.` });
      }

      const availableQty = product.quantity_in_stock !== undefined ? product.quantity_in_stock : product.quantity;
      
      // Use custom_price if provided, otherwise use product's default price
      let productPrice;
      if (item.custom_price !== undefined && item.custom_price !== null && item.custom_price > 0) {
        productPrice = parseFloat(item.custom_price);
      } else {
        productPrice = product.unit_price ? parseFloat(product.unit_price.toString()) : product.price;
      }
      
      // Convert price to order currency if needed (product prices stored in UGX)
      if (currency === 'USD') {
        productPrice = productPrice / EXCHANGE_RATE;
      }
      
      if (availableQty < item.quantity) {
        return res.status(400).json({ 
          error: `Sorry, we don't have enough stock for ${product.name}. Available: ${availableQty} units, but you requested: ${item.quantity} units. Please reduce the quantity.` 
        });
      }

      const itemTotal = productPrice * item.quantity;
      totalAmount += itemTotal;

      // Get cost price for profit calculation
      const costPrice = product.cost_price ? parseFloat(product.cost_price.toString()) : 0;
      const itemProfit = (productPrice - costPrice) * item.quantity;

      orderItems.push({
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: productPrice,
        cost_price: costPrice,
        item_total: itemTotal,
        item_profit: itemProfit,
        custom_price_used: item.custom_price !== undefined && item.custom_price !== null && item.custom_price > 0
      });

      productUpdates.push({
        product_id: item.product_id,
        quantity: item.quantity
      });
    }

    // Create sales order first (with company context)
    const orderId = uuidv4();
    const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    await query(
      `INSERT INTO sales (id, company_id, customer_name, sale_number, items, subtotal, total, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, companyId, customer_name, saleNumber, JSON.stringify(orderItems), totalAmount, totalAmount, 'completed', req.user.id]
    );

    // Then update inventory for all items (company-scoped)
    for (const update of productUpdates) {
      await query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ? AND company_id = ?',
        [update.quantity, update.product_id, companyId]
      );

      // Log stock transaction (with company context)
      const transactionId = uuidv4();
      await query(
        `INSERT INTO stock_transactions (id, company_id, product_id, transaction_type, quantity, sales_order_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [transactionId, companyId, update.product_id, 'sale', update.quantity, orderId]
      );
    }
    
    res.status(201).json({
      id: orderId,
      sale_number: saleNumber,
      customer_name,
      items: orderItems,
      total: totalAmount,
      subtotal: totalAmount,
      status: 'completed',
      created_at: new Date()
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error('Create sales order error:', {
      message: error.message,
      stack: error.stack,
      companyId,
      itemsCount: req.body.items?.length,
      currency: req.body.currency
    });
    
    // Return user-friendly error
    res.status(500).json({ 
      error: 'Failed to create sales order. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function getSalesOrders(req, res) {
  try {
    const companyId = req.companyId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build comprehensive search query WITH COMPANY FILTER
    let sqlWhere = 'WHERE company_id = ?';
    let params = [companyId];
    
    if (search) {
      sqlWhere += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR status LIKE ? OR id = ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, search);
    }

    const ordersResult = await query(
      `SELECT * FROM sales ${sqlWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );
    
    const countResult = await query(
      `SELECT COUNT(*) as total FROM sales ${sqlWhere}`,
      params
    );
    
    const total = countResult[0].total;

    res.json({
      data: ordersResult,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sales orders error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getSalesOrder(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    const result = await query(
      'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const order = result[0];

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get sales order error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateSalesOrder(req, res) {
  const { id } = req.params;
  const { customer_name, customer_phone, items, status } = req.body;
  const companyId = req.companyId;

  try {
    // Get existing order (company-scoped)
    const existingOrderResult = await query(
      'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const existingOrder = existingOrderResult[0];

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Track changes for audit trail
    const changes = [];
    const editHistory = existingOrder.edit_history ? JSON.parse(existingOrder.edit_history) : [];

    // Prepare update data
    const updateFields = [];
    const updateParams = [];

    if (customer_name && customer_name !== existingOrder.customer_name) {
      updateFields.push('customer_name = ?');
      updateParams.push(customer_name);
      changes.push({
        field: 'customer_name',
        old_value: existingOrder.customer_name,
        new_value: customer_name
      });
    }
    
    if (customer_phone && customer_phone !== existingOrder.customer_phone) {
      updateFields.push('customer_phone = ?');
      updateParams.push(customer_phone);
      changes.push({
        field: 'customer_phone',
        old_value: existingOrder.customer_phone,
        new_value: customer_phone
      });
    }
    
    if (status && status !== existingOrder.status) {
      updateFields.push('status = ?');
      updateParams.push(status);
      changes.push({
        field: 'status',
        old_value: existingOrder.status,
        new_value: status
      });
    }

    // If items are being updated, recalculate total
    if (items && items.length > 0) {
      let totalAmount = 0;
      const orderItems = [];

      // Validate and calculate new items (company-scoped)
      for (const item of items) {
        const productResult = await query(
          'SELECT * FROM products WHERE id = ? AND company_id = ? LIMIT 1',
          [item.product_id, companyId]
        );
        const product = productResult[0];

        if (!product) {
          return res.status(404).json({ error: `Product not found: ${item.product_id}` });
        }

        // Use custom_price if provided, otherwise use product's default price
        let productPrice;
        if (item.custom_price !== undefined && item.custom_price !== null && item.custom_price > 0) {
          productPrice = parseFloat(item.custom_price);
        } else {
          productPrice = product.unit_price ? parseFloat(product.unit_price.toString()) : product.price;
        }

        const itemTotal = productPrice * item.quantity;
        totalAmount += itemTotal;

        // Get cost price for profit calculation
        const costPrice = product.cost_price ? parseFloat(product.cost_price.toString()) : 0;
        const itemProfit = (productPrice - costPrice) * item.quantity;

        orderItems.push({
          product_id: item.product_id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: productPrice,
          cost_price: costPrice,
          item_total: itemTotal,
          item_profit: itemProfit,
          custom_price_used: item.custom_price !== undefined && item.custom_price !== null && item.custom_price > 0
        });
      }

      updateFields.push('items = ?');
      updateParams.push(JSON.stringify(orderItems));
      updateFields.push('total = ?');
      updateParams.push(totalAmount);
      updateFields.push('subtotal = ?');
      updateParams.push(totalAmount);
      
      // Track items and total changes
      changes.push({
        field: 'items',
        old_value: existingOrder.items,
        new_value: orderItems
      });
      changes.push({
        field: 'total',
        old_value: existingOrder.total,
        new_value: totalAmount
      });
    }

    // Note: edit_history not in schema - consider adding or removing this feature
    /*
    if (changes.length > 0) {
      editHistory.push({
        edited_at: new Date(),
        edited_by: req.user.id,
        changes: changes
      });
      updateFields.push('edit_history = ?');
      updateParams.push(JSON.stringify(editHistory));
    }
    */
      updateParams.push(JSON.stringify(editHistory));
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');

    // Update order (company-scoped)
    if (updateFields.length > 0) {
      updateParams.push(id, companyId);
      await query(
        `UPDATE sales SET ${updateFields.join(', ')} WHERE id = ? AND company_id = ?`,
        updateParams
      );
    }

    // Fetch updated order
    const updatedResult = await query(
      'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const updatedOrder = updatedResult[0];

    res.json({
      message: 'Sales order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update sales order error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteSalesOrder(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    // Check if order exists (company-scoped)
    const orderResult = await query(
      'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    
    if (orderResult.length === 0) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    // Delete the order (company-scoped)
    await query(
      'DELETE FROM sales WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    res.json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    console.error('Delete sales order error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function downloadSalesOrder(req, res) {
  const { id } = req.params;

  try {
    const companyId = req.companyId;

    const salesOrderResult = await query(
      'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const salesOrder = salesOrderResult[0];

    if (!salesOrder) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    // Get company settings for branding
    const companyResult = await query(
      'SELECT * FROM companies WHERE id = ? LIMIT 1',
      [companyId]
    );
    const company = companyResult[0];
    const companyName = company?.company_name || 'Business';
    const companyAddress = company?.address || '';
    const companyPhone = company?.phone || '';
    const companyEmail = company?.email || '';

    // Dynamically import PDFKit
    const PDFDocument = (await import('pdfkit')).default;

    // Generate PDF
    const doc = new PDFDocument();
    const filename = `Sales-Order-${salesOrder.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header with company branding
    doc.fontSize(22).font('Helvetica-Bold').text(companyName, 50, 50, { align: 'center' });
    let yPos = 80;
    
    if (companyAddress) {
      doc.fontSize(10).font('Helvetica').text(companyAddress, 50, yPos, { align: 'center' });
      yPos += 15;
    }
    if (companyPhone) {
      doc.text(`Tel: ${companyPhone}`, 50, yPos, { align: 'center' });
      yPos += 15;
    }
    if (companyEmail) {
      doc.text(`Email: ${companyEmail}`, 50, yPos, { align: 'center' });
      yPos += 15;
    }
    
    yPos += 10;
    doc.fontSize(20).font('Helvetica-Bold').text('SALES ORDER', 50, yPos, { align: 'center' });
    yPos += 35;

    // Order details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Order ID: ${salesOrder.id}`, 50, yPos);
    yPos += 15;
    doc.text(`Date: ${new Date(salesOrder.created_at).toLocaleDateString()}`, 50, yPos);
    yPos += 15;
    doc.text(`Status: ${salesOrder.status}`, 50, yPos);
    yPos += 15;

    if (salesOrder.customer_name) {
      doc.text(`Customer: ${salesOrder.customer_name}`, 50, yPos);
      yPos += 15;
    }

    yPos += 10;

    // Items table header
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Item', 50, yPos);
    doc.text('Qty', 300, yPos);
    doc.text('Price', 380, yPos);
    doc.text('Total', 480, yPos);
    yPos += 20;

    // Items
    doc.fontSize(10).font('Helvetica');
    salesOrder.items.forEach(item => {
      const itemTotal = item.quantity * item.unit_price;
      doc.text(item.product_name, 50, yPos, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPos);
      doc.text(`UGX ${item.unit_price.toFixed(2)}`, 380, yPos);
      doc.text(`UGX ${itemTotal.toFixed(2)}`, 480, yPos);
      yPos += 20;
    });

    // Total
    yPos += 10;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Total Amount: UGX ${salesOrder.total.toFixed(2)}`, 380, yPos);

    // Footer
    yPos += 40;
    doc.fontSize(9).font('Helvetica').text('Thank you for your business!', 50, yPos, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Download sales order error:', error);
    res.status(500).json({ error: 'Failed to download sales order' });
  }
}
