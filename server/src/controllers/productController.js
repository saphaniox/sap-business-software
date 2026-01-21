import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { addCompanyContext, createCompanyFilter } from '../middleware/tenantContext.js';

export async function createProduct(req, res) {
  const { name, sku, description, price, cost_price = 0, quantity, low_stock_threshold = 10 } = req.body;
  const userId = req.user.id;
  const companyId = req.companyId;

  try {
    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Product name is required and must be a valid string.' });
    }
    
    if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
      return res.status(400).json({ error: 'SKU is required and must be a valid string.' });
    }
    
    // Validate numeric fields
    const sellingPrice = parseFloat(price);
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      return res.status(400).json({ error: 'Selling price must be a valid positive number.' });
    }
    
    const costPrice = parseFloat(cost_price);
    if (isNaN(costPrice) || costPrice < 0) {
      return res.status(400).json({ error: 'Cost price must be a valid positive number.' });
    }
    
    const productQuantity = parseInt(quantity);
    if (isNaN(productQuantity) || productQuantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a valid non-negative integer.' });
    }
    
    const stockThreshold = parseInt(low_stock_threshold);
    if (isNaN(stockThreshold) || stockThreshold < 0) {
      return res.status(400).json({ error: 'Low stock threshold must be a valid non-negative integer.' });
    }
    
    // Check if SKU already exists IN THIS BUSINESS ONLY
    const existingResult = await query(
      'SELECT * FROM products WHERE sku = ? AND company_id = ?',
      [sku, companyId]
    );
    if (existingResult.length > 0) {
      return res.status(400).json({ error: `This SKU "${sku}" is already in use. Please use a unique SKU for each product.` });
    }

    const profit = sellingPrice - costPrice;
    const profitMargin = sellingPrice > 0 ? ((profit / sellingPrice) * 100) : 0;

    const productId = uuidv4();
    await query(
      `INSERT INTO products 
       (id, company_id, created_by, name, sku, description, selling_price, cost_price, quantity, reorder_level, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [productId, companyId, userId, name, sku, description || '', sellingPrice, costPrice, productQuantity, stockThreshold]
    );

    res.status(201).json({
      _id: productId,
      name,
      sku,
      description: description || '',
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity) || 0,
      created_at: new Date(),
      updated_at: new Date()
    });
  } catch (error) {
    // Log error details for debugging (but don't expose to client)
    console.error('Create product error:', {
      message: error.message,
      stack: error.stack,
      userId,
      companyId,
      productName: req.body.name
    });
    
    // Return user-friendly error message
    res.status(500).json({ 
      error: 'Failed to create product. Please try again or contact support if the problem persists.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function getAllProducts(req, res) {
  try {
    const companyId = req.companyId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 999999;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Build SQL query with search
    let sqlQuery = 'SELECT * FROM products WHERE company_id = ?';
    let params = [companyId];
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE company_id = ?';
    let countParams = [companyId];

    if (search) {
      const searchPattern = `%${search}%`;
      sqlQuery += ' AND (name LIKE ? OR sku LIKE ? OR description LIKE ? OR id = ?)';
      params.push(searchPattern, searchPattern, searchPattern, search);
      countQuery += ' AND (name LIKE ? OR sku LIKE ? OR description LIKE ? OR id = ?)';
      countParams.push(searchPattern, searchPattern, searchPattern, search);
    }

    sqlQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [productsResult, countResult] = await Promise.all([
      query(sqlQuery, params),
      query(countQuery, countParams)
    ]);

    const products = productsResult;
    const total = countResult[0].total;

    // Map database fields to API response format
    const mappedProducts = products.map(p => {
      const profit = (p.selling_price || 0) - (p.cost_price || 0);
      const profitMargin = p.selling_price > 0 ? ((profit / p.selling_price) * 100) : 0;
      return {
        ...p,
        _id: p.id,
        price: p.selling_price || 0,
        unit_price: p.selling_price || 0,
        cost_price: p.cost_price || 0,
        profit: profit,
        profit_margin: profitMargin,
        quantity: p.quantity || 0,
        quantity_in_stock: p.quantity || 0,
        low_stock_threshold: p.reorder_level || 10,
        is_low_stock: (p.quantity || 0) <= (p.reorder_level || 10)
      };
    });

    res.json({
      data: mappedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, sku, description, price, cost_price, quantity, low_stock_threshold } = req.body;
  const companyId = req.companyId;

  try {
    const sellingPrice = parseFloat(price) || 0;
    const costPrice = cost_price !== undefined ? parseFloat(cost_price) : undefined;
    
    let updateParts = [
      'name = ?',
      'sku = ?',
      'description = ?',
      'selling_price = ?',
      'quantity = ?',
      'updated_by = ?',
      'updated_at = NOW()'
    ];
    let updateValues = [
      name,
      sku,
      description || '',
      sellingPrice,
      parseInt(quantity) || 0,
      req.user.id
    ];

    if (low_stock_threshold !== undefined) {
      updateParts.push('reorder_level = ?');
      updateValues.push(parseInt(low_stock_threshold));
    }

    // Update cost_price if provided
    if (costPrice !== undefined) {
      updateParts.push('cost_price = ?');
      updateValues.push(costPrice);
    }

    // Add WHERE conditions
    updateValues.push(id, companyId);

    // CRITICAL: Only update products belonging to this business
    await query(
      `UPDATE products SET ${updateParts.join(', ')} WHERE id = ? AND company_id = ?`,
      updateValues
    );

    // Fetch updated product
    const productResult = await query(
      'SELECT * FROM products WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    const product = productResult[0];
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Map database fields to API response format
    const profit = (product.selling_price || 0) - (product.cost_price || 0);
    const profitMargin = product.selling_price > 0 ? ((profit / product.selling_price) * 100) : 0;
    res.json({
      ...product,
      _id: product.id,
      price: product.selling_price || 0,
      unit_price: product.selling_price || 0,
      quantity: product.quantity || 0,
      quantity_in_stock: product.quantity || 0,
      low_stock_threshold: product.reorder_level || 10,
      profit: profit,
      profit_margin: profitMargin
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    // CRITICAL: Only delete products belonging to this business
    const result = await query(
      'DELETE FROM products WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted', id });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getProductDemand(req, res) {
  try {
    const companyId = req.companyId;

    // Get sales aggregation by product
    const salesResult = await query(
      `SELECT 
         si.product_id,
         SUM(si.quantity) as total_sold,
         SUM(si.item_total) as total_revenue,
         COUNT(DISTINCT si.sale_id) as order_count
       FROM sales_items si
       INNER JOIN sales s ON si.sale_id = s.id
       WHERE s.company_id = ?
       GROUP BY si.product_id
       ORDER BY total_sold DESC`,
      [companyId]
    );

    // Get all products belonging to this business
    const productsResult = await query(
      'SELECT * FROM products WHERE company_id = ?',
      [companyId]
    );
    const allProducts = productsResult;
    
    // Create a set of valid product IDs
    const validProductIds = new Set(allProducts.map(p => p.id));

    // Create a map of product sales data (only for existing products)
    const salesMap = new Map();
    let validSalesCount = 0;
    
    salesResult.forEach(sale => {
      const productId = sale.product_id;
      // Only count sales for products that still exist
      if (validProductIds.has(productId)) {
        salesMap.set(productId, {
          total_sold: sale.total_sold || 0,
          total_revenue: sale.total_revenue || 0,
          order_count: sale.order_count || 0
        });
        validSalesCount++;
      }
    });

    // Calculate overall statistics for demand classification
    const soldQuantities = Array.from(salesMap.values()).map(s => s.total_sold);
    const avgSold = soldQuantities.length > 0 
      ? soldQuantities.reduce((a, b) => a + b, 0) / soldQuantities.length 
      : 0;
    const maxSold = soldQuantities.length > 0 ? Math.max(...soldQuantities) : 0;

    // Classify products by demand level
    const productsWithDemand = allProducts.map(product => {
      const productId = product.id;
      const salesData = salesMap.get(productId) || { 
        total_sold: 0, 
        total_revenue: 0, 
        order_count: 0 
      };

      // Determine demand level based on sales
      let demand_level = 'low';
      if (salesData.total_sold === 0) {
        demand_level = 'none';
      } else if (salesData.total_sold >= avgSold * 1.5) {
        demand_level = 'high';
      } else if (salesData.total_sold >= avgSold * 0.5) {
        demand_level = 'medium';
      }

      return {
        _id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.selling_price || 0,
        current_stock: product.quantity || 0,
        total_sold: salesData.total_sold,
        total_revenue: salesData.total_revenue,
        order_count: salesData.order_count,
        demand_level
      };
    });

    // Sort by total sold (descending)
    productsWithDemand.sort((a, b) => b.total_sold - a.total_sold);

    // Separate into high and low demand
    const highDemand = productsWithDemand.filter(p => p.demand_level === 'high');
    const mediumDemand = productsWithDemand.filter(p => p.demand_level === 'medium');
    const lowDemand = productsWithDemand.filter(p => ['low', 'none'].includes(p.demand_level));

    // Calculate products without sales (using valid sales count)
    const productsWithoutSales = allProducts.length - validSalesCount;

    res.json({
      all_products: productsWithDemand,
      high_demand: highDemand,
      medium_demand: mediumDemand,
      low_demand: lowDemand,
      statistics: {
        total_products: allProducts.length,
        products_with_sales: validSalesCount,
        products_without_sales: productsWithoutSales,
        average_sold: Math.round(avgSold * 100) / 100,
        max_sold: maxSold
      }
    });
  } catch (error) {
    console.error('Get product demand error:', error);
    res.status(500).json({ error: error.message });
  }
}
