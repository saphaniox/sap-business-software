import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';

export async function generateInvoice(req, res) {
  const { sales_order_id, customer_name, customer_phone, items, notes, currency = 'UGX' } = req.body;
  const companyId = req.companyId;

  try {
    // Validate currency
    if (!['UGX', 'USD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be either UGX or USD' });
    }

    const EXCHANGE_RATE = 3700;

    let invoiceData = {
      customer_name: '',
      customer_phone: '',
      items: [],
      total_amount: 0,
      currency: currency,
      exchange_rate: EXCHANGE_RATE
    };

    // Two modes: from sales order OR direct invoice creation
    if (sales_order_id) {
      // Mode 1: Generate invoice from existing sales order
      const orderResult = await query(
        'SELECT * FROM sales WHERE id = ? AND company_id = ? LIMIT 1',
        [sales_order_id, companyId]
      );
      const order = orderResult.rows[0];

      if (!order) {
        return res.status(404).json({ error: 'Sales order not found' });
      }

      // Parse items if stored as JSON
      const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

      // Use the order's currency if available
      const orderCurrency = order.currency || 'UGX';
      const orderExchangeRate = order.exchange_rate || EXCHANGE_RATE;

      invoiceData = {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        items: orderItems,
        total_amount: order.total_amount,
        currency: orderCurrency,
        exchange_rate: orderExchangeRate,
        sales_order_id: sales_order_id,
        served_by_user_id: order.served_by_user_id || req.user.id,
        served_by_username: order.served_by_username || req.user.username
      };
    } else {
      // Mode 2: Create invoice directly with products
      if (!items || items.length === 0) {
        return res.status(400).json({ 
          error: 'Please add at least one item to create an invoice.'
        });
      }
      
      // Auto-register customer if both name and phone are provided
      if (customer_name && customer_phone) {
        const existingCustomerResult = await query(
          'SELECT * FROM customers WHERE phone = ? AND company_id = ? LIMIT 1',
          [customer_phone, companyId]
        );
        
        if (existingCustomerResult.rows.length === 0) {
          // Auto-register new customer
          const customerId = uuidv4();
          const created_at = new Date().toISOString();
          
          await query(
            `INSERT INTO customers (id, company_id, name, phone, email, address, total_purchases, total_spent, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [customerId, companyId, customer_name, customer_phone, '', '', 0, 0, created_at, created_at]
          );
        }
      }

      // Fetch product details and calculate totals
      const invoiceItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const productResult = await query(
          'SELECT * FROM products WHERE id = ? AND company_id = ? LIMIT 1',
          [item.product_id, companyId]
        );
        const product = productResult.rows[0];

        if (!product) {
          return res.status(404).json({ 
            error: `Product not found: ${item.product_id}` 
          });
        }

        const quantity = parseInt(item.quantity);
        
        // Use custom_price if provided, otherwise use product's default price
        let unitPrice;
        if (item.custom_price !== undefined && item.custom_price !== null && item.custom_price > 0) {
          unitPrice = parseFloat(item.custom_price);
        } else {
          unitPrice = parseFloat(product.unit_price);
        }
        
        // Convert price to invoice currency if needed
        if (currency === 'USD') {
          unitPrice = unitPrice / EXCHANGE_RATE;
        }

        const itemTotal = unitPrice * quantity;
        const costPrice = product.cost_price ? parseFloat(product.cost_price) : 0;
        const itemProfit = (unitPrice - costPrice) * quantity;

        invoiceItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: quantity,
          unit_price: unitPrice,
          cost_price: costPrice,
          item_profit: itemProfit,
          item_total: itemTotal,
          custom_price_used: item.custom_price !== undefined && item.custom_price !== null && item.custom_price > 0
        });

        totalAmount += itemTotal;
      }

      invoiceData = {
        customer_name,
        customer_phone,
        items: invoiceItems,
        total_amount: totalAmount,
        currency: currency,
        exchange_rate: EXCHANGE_RATE,
        served_by_user_id: req.user.id,
        served_by_username: req.user.username
      };
    }

    // Generate invoice number
    const countResult = await query(
      'SELECT COUNT(*) as count FROM invoices WHERE company_id = ?',
      [companyId]
    );
    const invoiceCount = countResult.rows[0].count;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${invoiceCount + 1}`;

    // Create invoice
    const invoiceId = uuidv4();
    const created_at = new Date().toISOString();

    await query(
      `INSERT INTO invoices (id, company_id, invoice_number, customer_name, customer_phone, 
       items, total_amount, currency, exchange_rate, served_by_user_id, served_by_username, 
       notes, status, sales_order_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        companyId,
        invoiceNumber,
        invoiceData.customer_name,
        invoiceData.customer_phone,
        JSON.stringify(invoiceData.items),
        invoiceData.total_amount,
        invoiceData.currency,
        invoiceData.exchange_rate,
        invoiceData.served_by_user_id,
        invoiceData.served_by_username,
        notes || '',
        'generated',
        invoiceData.sales_order_id || null,
        created_at,
        created_at
      ]
    );

    res.status(201).json({
      id: invoiceId,
      invoice_number: invoiceNumber,
      customer_name: invoiceData.customer_name,
      total_amount: invoiceData.total_amount,
      status: 'generated'
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getInvoices(req, res) {
  try {
    const companyId = req.companyId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [invoicesResult, countResult] = await Promise.all([
      query(
        'SELECT * FROM invoices WHERE company_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [companyId, limit, offset]
      ),
      query(
        'SELECT COUNT(*) as count FROM invoices WHERE company_id = ?',
        [companyId]
      )
    ]);

    // Parse JSON items
    const invoices = invoicesResult.rows.map(inv => ({
      ...inv,
      items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items
    }));

    const total = countResult.rows[0].count;

    res.json({
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getInvoice(req, res) {
  const { id } = req.params;

  try {
    const companyId = req.companyId;
    const result = await query(
      'SELECT * FROM invoices WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = result.rows[0];
    // Parse JSON items
    invoice.items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateInvoice(req, res) {
  const { id } = req.params;
  const { customer_name, customer_phone, items, notes, status } = req.body;

  try {
    const companyId = req.companyId;

    // Get existing invoice
    const existingResult = await query(
      'SELECT * FROM invoices WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Prepare update data
    const updates = [];
    const values = [];

    if (customer_name) {
      updates.push('customer_name = ?');
      values.push(customer_name);
    }
    if (customer_phone) {
      updates.push('customer_phone = ?');
      values.push(customer_phone);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    // If items are being updated, recalculate total
    if (items && items.length > 0) {
      let totalAmount = 0;
      const invoiceItems = [];

      for (const item of items) {
        const productResult = await query(
          'SELECT * FROM products WHERE id = ? AND company_id = ? LIMIT 1',
          [item.product_id, companyId]
        );
        const product = productResult.rows[0];

        if (!product) {
          return res.status(404).json({ error: `Product not found: ${item.product_id}` });
        }

        const quantity = parseInt(item.quantity);
        const unitPrice = parseFloat(product.unit_price);
        const itemTotal = unitPrice * quantity;

        invoiceItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: quantity,
          unit_price: unitPrice,
          item_total: itemTotal
        });

        totalAmount += itemTotal;
      }

      updates.push('items = ?');
      values.push(JSON.stringify(invoiceItems));
      updates.push('total_amount = ?');
      values.push(totalAmount);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id, companyId);

    await query(
      `UPDATE invoices SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
      values
    );

    // Get updated invoice
    const updatedResult = await query(
      'SELECT * FROM invoices WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    const updatedInvoice = updatedResult.rows[0];
    updatedInvoice.items = typeof updatedInvoice.items === 'string' ? JSON.parse(updatedInvoice.items) : updatedInvoice.items;

    res.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteInvoice(req, res) {
  const { id } = req.params;

  try {
    const companyId = req.companyId;

    // Check if invoice exists
    const checkResult = await query(
      'SELECT * FROM invoices WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete the invoice
    await query(
      'DELETE FROM invoices WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function downloadInvoice(req, res) {
  const { id } = req.params;

  try {
    const companyId = req.companyId;

    const invoiceResult = await query(
      'SELECT * FROM invoices WHERE id = ? AND company_id = ? LIMIT 1',
      [id, companyId]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    // Parse JSON items
    invoice.items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;

    // Get company settings for branding
    const companyResult = await query(
      'SELECT * FROM companies WHERE id = ? LIMIT 1',
      [companyId]
    );
    const company = companyResult.rows[0];
    const companyName = company?.company_name || 'Business';
    const companyAddress = company?.address || '';
    const companyPhone = company?.phone || '';
    const companyEmail = company?.email || '';

    // Generate PDF
    const doc = new PDFDocument();
    const filename = `${invoice.invoice_number}.pdf`;

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
    doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 50, yPos, { align: 'center' });
    yPos += 35;
    
    // Invoice details
    doc.fontSize(10).font('Helvetica').text(`Invoice #: ${invoice.invoice_number}`, 50, yPos);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 400, yPos);
    yPos += 20;
    
    // Served by info
    if (invoice.served_by_username) {
      doc.text(`Served By: ${invoice.served_by_username}`, 50, yPos);
      yPos += 20;
    }

    // Customer info
    doc.fontSize(12).font('Helvetica-Bold').text('Customer Details', 50, yPos);
    yPos += 20;
    doc.fontSize(10).font('Helvetica')
      .text(`Name: ${invoice.customer_name}`, 50, yPos)
      .text(`Phone: ${invoice.customer_phone}`, 50, yPos + 15);
    yPos += 40;

    // Items table
    doc.fontSize(12).font('Helvetica-Bold').text('Items', 50, yPos);
    yPos += 25;
    const itemsHeight = 15;
    
    // Table header
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Product', 50, yPos);
    doc.text('Qty', 300, yPos);
    doc.text('Unit Price', 350, yPos);
    doc.text('Total', 450, yPos);
    
    yPos += itemsHeight + 5;
    doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(50, yPos).lineTo(500, yPos).stroke();
    yPos += 10;

    // Items
    const currency = invoice.currency || 'UGX';
    const currencySymbol = currency === 'USD' ? '$' : 'UGX';
    
    doc.fontSize(9).font('Helvetica');
    invoice.items.forEach((item) => {
      doc.text(item.product_name.substring(0, 35), 50, yPos);
      doc.text(item.quantity.toString(), 300, yPos);
      const unitPriceText = currency === 'USD' ? `${currencySymbol}${item.unit_price.toLocaleString()}` : `${currencySymbol} ${item.unit_price.toLocaleString()}`;
      const itemTotalText = currency === 'USD' ? `${currencySymbol}${item.item_total.toLocaleString()}` : `${currencySymbol} ${item.item_total.toLocaleString()}`;
      doc.text(unitPriceText, 350, yPos);
      doc.text(itemTotalText, 450, yPos);
      yPos += itemsHeight;
    });

    yPos += 10;
    doc.strokeColor('#000000').lineWidth(1).moveTo(50, yPos).lineTo(500, yPos).stroke();
    yPos += 15;

    // Total
    const totalText = currency === 'USD' ? `${currencySymbol}${invoice.total_amount.toLocaleString()}` : `${currencySymbol} ${invoice.total_amount.toLocaleString()}`;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Total Amount: ${totalText}`, 350, yPos);

    // Notes
    if (invoice.notes) {
      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Notes:', 50, yPos);
      yPos += 15;
      doc.fontSize(9).font('Helvetica').text(invoice.notes, 50, yPos, { width: 450, align: 'left' });
    }

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#999999');
    doc.text('Thank you for your business!', 50, doc.page.height - 70, { align: 'center' });
    doc.text(`© ${companyName} | ${new Date().getFullYear()}`, 50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ error: error.message });
  }
}
