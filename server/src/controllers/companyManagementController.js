import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to log audit
async function logAudit(adminId, adminEmail, action, targetType, targetId, targetName, details, req, status = 'success') {
  try {
    await query(
      `INSERT INTO audit_logs 
      (id, user_id, user_email, action, entity_type, entity_id, entity_name, details, ip_address, user_agent, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        adminId,
        adminEmail,
        action,
        targetType,
        targetId,
        targetName,
        JSON.stringify(details),
        req.ip || req.connection?.remoteAddress || 'unknown',
        req.get('user-agent') || 'unknown',
        status,
        new Date(),
        new Date()
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Get all companies with statistics
export const getAllCompanies = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    // Build WHERE clause
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(company_name LIKE ? OR email LIKE ? OR business_type LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get companies with pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [companies] = await query(
      `SELECT * FROM companies ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [totalResult] = await query(
      `SELECT COUNT(*) as total FROM companies ${whereClause}`,
      params
    );

    const total = totalResult[0].total;

    // Get statistics for each company (user count, etc.)
    const companiesWithStats = await Promise.all(companies.map(async (company) => {
      const [userCount] = await query(
        'SELECT COUNT(*) as count FROM users WHERE company_id = ?',
        [company.id]
      );

      const [productCount] = await query(
        'SELECT COUNT(*) as count FROM products WHERE company_id = ?',
        [company.id]
      );

      const [salesCount] = await query(
        'SELECT COUNT(*) as count FROM sales WHERE company_id = ?',
        [company.id]
      );

      // Parse JSON fields
      if (company.settings && typeof company.settings === 'string') {
        company.settings = JSON.parse(company.settings);
      }
      if (company.industry_features && typeof company.industry_features === 'string') {
        company.industry_features = JSON.parse(company.industry_features);
      }

      return {
        ...company,
        userCount: userCount[0].count,
        productCount: productCount[0].count,
        salesCount: salesCount[0].count
      };
    }));

    res.json({
      companies: companiesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Get company by ID with detailed stats
export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    // Parse JSON fields
    if (company.settings && typeof company.settings === 'string') {
      company.settings = JSON.parse(company.settings);
    }
    if (company.industry_features && typeof company.industry_features === 'string') {
      company.industry_features = JSON.parse(company.industry_features);
    }

    // Get detailed statistics
    const [users] = await query(
      'SELECT * FROM users WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );

    const [userCount] = await query(
      'SELECT COUNT(*) as count FROM users WHERE company_id = ?',
      [companyId]
    );

    const [productCount] = await query(
      'SELECT COUNT(*) as count FROM products WHERE company_id = ?',
      [companyId]
    );

    const [customerCount] = await query(
      'SELECT COUNT(*) as count FROM customers WHERE company_id = ?',
      [companyId]
    );

    const [salesCount] = await query(
      'SELECT COUNT(*) as count FROM sales WHERE company_id = ?',
      [companyId]
    );

    const [invoiceCount] = await query(
      'SELECT COUNT(*) as count FROM invoices WHERE company_id = ?',
      [companyId]
    );

    const [totalRevenue] = await query(
      'SELECT SUM(total_amount) as total FROM sales WHERE company_id = ? AND status = ?',
      [companyId, 'completed']
    );

    res.json({
      company,
      users,
      statistics: {
        userCount: userCount[0].count,
        productCount: productCount[0].count,
        customerCount: customerCount[0].count,
        salesCount: salesCount[0].count,
        invoiceCount: invoiceCount[0].count,
        totalRevenue: totalRevenue[0].total || 0
      }
    });
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
};

// Suspend company
export const suspendCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Suspension reason is required' });
    }

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    await query(
      'UPDATE companies SET status = ?, updated_at = ? WHERE id = ?',
      ['suspended', new Date(), companyId]
    );

    // Log audit
    await logAudit(
      req.user.id,
      req.user.email,
      'suspend_company',
      'company',
      companyId,
      company.company_name,
      { reason },
      req
    );

    res.json({
      message: 'Company suspended successfully',
      company: {
        ...company,
        status: 'suspended'
      }
    });
  } catch (error) {
    console.error('Suspend company error:', error);
    res.status(500).json({ error: 'Failed to suspend company' });
  }
};

// Activate company
export const activateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    await query(
      'UPDATE companies SET status = ?, updated_at = ? WHERE id = ?',
      ['approved', new Date(), companyId]
    );

    // Log audit
    await logAudit(
      req.user.id,
      req.user.email,
      'activate_company',
      'company',
      companyId,
      company.company_name,
      {},
      req
    );

    res.json({
      message: 'Company activated successfully',
      company: {
        ...company,
        status: 'approved'
      }
    });
  } catch (error) {
    console.error('Activate company error:', error);
    res.status(500).json({ error: 'Failed to activate company' });
  }
};

// Block company
export const blockCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Block reason is required' });
    }

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    await query(
      'UPDATE companies SET status = ?, updated_at = ? WHERE id = ?',
      ['blocked', new Date(), companyId]
    );

    // Log audit
    await logAudit(
      req.user.id,
      req.user.email,
      'block_company',
      'company',
      companyId,
      company.company_name,
      { reason },
      req
    );

    res.json({
      message: 'Company blocked successfully',
      company: {
        ...company,
        status: 'blocked'
      }
    });
  } catch (error) {
    console.error('Block company error:', error);
    res.status(500).json({ error: 'Failed to block company' });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    // Delete all related data (cascading delete)
    await query('DELETE FROM users WHERE company_id = ?', [companyId]);
    await query('DELETE FROM products WHERE company_id = ?', [companyId]);
    await query('DELETE FROM customers WHERE company_id = ?', [companyId]);
    await query('DELETE FROM sales WHERE company_id = ?', [companyId]);
    await query('DELETE FROM invoices WHERE company_id = ?', [companyId]);
    await query('DELETE FROM expenses WHERE company_id = ?', [companyId]);
    await query('DELETE FROM returns WHERE company_id = ?', [companyId]);
    await query('DELETE FROM notifications WHERE company_id = ?', [companyId]);
    await query('DELETE FROM support_tickets WHERE company_id = ?', [companyId]);
    await query('DELETE FROM companies WHERE id = ?', [companyId]);

    // Log audit
    await logAudit(
      req.user.id,
      req.user.email,
      'delete_company',
      'company',
      companyId,
      company.company_name,
      {},
      req
    );

    res.json({ message: 'Company and all related data deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get total companies
    const [totalCompanies] = await query('SELECT COUNT(*) as count FROM companies');

    // Get companies by status
    const [approvedCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['approved']);
    const [pendingCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['pending_approval']);
    const [suspendedCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['suspended']);
    const [blockedCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['blocked']);

    // Get total users
    const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');

    // Get total products across all companies
    const [totalProducts] = await query('SELECT COUNT(*) as count FROM products');

    // Get total sales
    const [totalSales] = await query('SELECT COUNT(*) as count FROM sales');

    // Get total revenue
    const [totalRevenue] = await query('SELECT SUM(total_amount) as total FROM sales WHERE status = ?', ['completed']);

    // Get recent companies
    const [recentCompanies] = await query(
      'SELECT * FROM companies ORDER BY created_at DESC LIMIT 5'
    );

    // Get companies by business type
    const [businessTypeStats] = await query(
      `SELECT business_type, COUNT(*) as count 
       FROM companies 
       GROUP BY business_type 
       ORDER BY count DESC`
    );

    res.json({
      statistics: {
        totalCompanies: totalCompanies[0].count,
        approvedCompanies: approvedCompanies[0].count,
        pendingCompanies: pendingCompanies[0].count,
        suspendedCompanies: suspendedCompanies[0].count,
        blockedCompanies: blockedCompanies[0].count,
        totalUsers: totalUsers[0].count,
        totalProducts: totalProducts[0].count,
        totalSales: totalSales[0].count,
        totalRevenue: totalRevenue[0].total || 0
      },
      recentCompanies,
      businessTypeStats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, companyId } = req.query;

    const conditions = [];
    const params = [];

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    if (companyId) {
      conditions.push('entity_id = ?');
      params.push(companyId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [logs] = await query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [totalResult] = await query(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );

    const total = totalResult[0].total;

    // Parse JSON details field
    const parsedLogs = logs.map(log => ({
      ...log,
      details: log.details && typeof log.details === 'string' ? JSON.parse(log.details) : log.details
    }));

    res.json({
      logs: parsedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
