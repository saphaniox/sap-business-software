import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { addCompanyContext, createCompanyFilter } from '../middleware/tenantContext.js';

export async function createCustomer(req, res) {
  const { name, phone, email, address } = req.body;
  const companyId = req.companyId;

  try {
    // Check if customer already exists (within this business)
    const existingResult = await query(
      'SELECT * FROM customers WHERE phone = ? AND company_id = ?',
      [phone, companyId]
    );
    if (existingResult.length > 0) {
      return res.status(400).json({ error: `A customer with phone number "${phone}" already exists. Please use a different phone number or update the existing customer.` });
    }

    const customerId = uuidv4();
    await query(
      `INSERT INTO customers 
       (id, company_id, name, phone, email, address, total_purchases) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [customerId, companyId, name, phone, email || '', address || '']
    );

    res.status(201).json({
      _id: customerId,
      name,
      phone,
      email,
      address,
      total_purchases: 0,
      total_spent: 0
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getAllCustomers(req, res) {
  try {
    const companyId = req.companyId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Build SQL query with search
    let sqlQuery = 'SELECT * FROM customers WHERE company_id = ?';
    let params = [companyId];
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE company_id = ?';
    let countParams = [companyId];

    if (search) {
      const searchPattern = `%${search}%`;
      sqlQuery += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR address LIKE ? OR id = ?)';
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, search);
      countQuery += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR address LIKE ? OR id = ?)';
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, search);
    }

    sqlQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [customersResult, countResult] = await Promise.all([
      query(sqlQuery, params),
      query(countQuery, countParams)
    ]);

    const customers = customersResult.map(c => ({ ...c, _id: c.id }));
    const total = countResult[0].total;

    // Return both formats for compatibility
    if (req.query.page || req.query.limit) {
      res.json({
        data: customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      res.json(customers);
    }
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCustomer(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    const result = await query(
      'SELECT * FROM customers WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    const customer = result[0];

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ ...customer, _id: customer.id });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, phone, email, address } = req.body;
  const companyId = req.companyId;

  try {
    await query(
      `UPDATE customers 
       SET name = ?, phone = ?, email = ?, address = ?, updated_at = NOW() 
       WHERE id = ? AND company_id = ?`,
      [name, phone, email, address, id, companyId]
    );

    const result = await query(
      'SELECT * FROM customers WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    const customer = result[0];
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ ...customer, _id: customer.id });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getCustomerPurchaseHistory(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    // Get customer (company-scoped)
    const customerResult = await query(
      'SELECT * FROM customers WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    const customer = customerResult[0];
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get all sales orders for this customer (company-scoped)
    const ordersResult = await query(
      `SELECT * FROM sales 
       WHERE company_id = ? AND (customer_phone = ? OR customer_name = ?) 
       ORDER BY sale_date DESC`,
      [companyId, customer.phone, customer.name]
    );
    const orders = ordersResult.map(o => {
      // Parse items if stored as JSON string
      if (typeof o.items === 'string') {
        try { o.items = JSON.parse(o.items); } catch (e) { o.items = []; }
      }
      return { ...o, _id: o.id, order_date: o.sale_date, total_amount: o.total_amount };
    });

    // Get all invoices for this customer (company-scoped)
    const invoicesResult = await query(
      `SELECT * FROM invoices 
       WHERE company_id = ? AND (customer_phone = ? OR customer_name = ?) 
       ORDER BY created_at DESC`,
      [companyId, customer.phone, customer.name]
    );
    const invoices = invoicesResult.map(i => ({ ...i, _id: i.id }));

    // Calculate statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Get most purchased products
    const productCounts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const productName = item.product_name;
        if (productName) {
          productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Get last order date
    const lastOrderDate = orders.length > 0 ? orders[0].order_date : null;

    res.json({
      customer: {
        ...customer,
        _id: customer.id,
        id: customer.id
      },
      stats: {
        total_orders: totalOrders,
        total_spent: totalSpent,
        avg_order_value: avgOrderValue,
        last_order_date: lastOrderDate
      },
      orders,
      invoices,
      top_products: topProducts
    });
  } catch (error) {
    console.error('Get customer purchase history error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCustomer(req, res) {
  const { id } = req.params;
  const companyId = req.companyId;

  try {
    const result = await query(
      'DELETE FROM customers WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted', id });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: error.message });
  }
}
