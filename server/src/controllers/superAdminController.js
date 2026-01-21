import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

// Super Admin Login
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find super admin
    const superAdmins = await query(
      'SELECT * FROM superadmins WHERE email = ?',
      [email]
    );

    if (superAdmins.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const superAdmin = superAdmins[0];

    // Check if account is active
    if (!superAdmin.is_active) {
      return res.status(403).json({ error: 'Account is disabled. Contact system administrator.' });
    }

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, superAdmin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: superAdmin.id,
        email: superAdmin.email,
        role: 'superadmin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await query(
      'UPDATE superadmins SET last_login = ? WHERE id = ?',
      [new Date(), superAdmin.id]
    );

    // Log audit
    await logAudit(superAdmin.id, superAdmin.email, 'login', 'superadmin', superAdmin.id, email, {}, req);

    // Parse permissions if stored as JSON string
    const permissions = typeof superAdmin.permissions === 'string' 
      ? JSON.parse(superAdmin.permissions) 
      : superAdmin.permissions;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: 'superadmin',
        permissions: permissions
      }
    });

  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current super admin
export const getCurrentSuperAdmin = async (req, res) => {
  try {
    const [superAdmins] = await query(
      'SELECT id, email, name, is_active, created_at, last_login FROM superadmins WHERE id = ?',
      [req.user.id]
    );

    if (superAdmins.length === 0) {
      return res.status(404).json({ error: 'Super admin not found' });
    }

    res.json({ superAdmin: superAdmins[0] });

  } catch (error) {
    console.error('Get current super admin error:', error);
    res.status(500).json({ error: 'Failed to fetch super admin details' });
  }
};

// Super Admin Logout
export const superAdminLogout = async (req, res) => {
  try {
    // Log audit
    await logAudit(req.user.id, req.user.email, 'logout', 'superadmin', req.user.id, req.user.email, {}, req);

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Super admin logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Create new super admin
export const createSuperAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if email already exists
    const [existing] = await query(
      'SELECT * FROM superadmins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create super admin
    const superAdminId = uuidv4();
    const now = new Date();

    await query(
      `INSERT INTO superadmins (id, email, password_hash, name, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [superAdminId, email, hashedPassword, name, 1, now, now]
    );

    // Log audit
    await logAudit(req.user.id, req.user.email, 'create_superadmin', 'superadmin', superAdminId, email, {}, req);

    res.status(201).json({
      message: 'Super admin created successfully',
      superAdmin: { id: superAdminId, email, name }
    });

  } catch (error) {
    console.error('Create super admin error:', error);
    res.status(500).json({ error: 'Failed to create super admin' });
  }
};

// Get all super admins
export const getAllSuperAdmins = async (req, res) => {
  try {
    const [superAdmins] = await query(
      'SELECT id, email, name, is_active, created_at, last_login FROM superadmins ORDER BY created_at DESC'
    );

    res.json({ superAdmins });

  } catch (error) {
    console.error('Get all super admins error:', error);
    res.status(500).json({ error: 'Failed to fetch super admins' });
  }
};

// Update super admin
export const updateSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active ? 1 : 0);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date());
    updateValues.push(id);

    await query(
      `UPDATE superadmins SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Log audit
    await logAudit(req.user.id, req.user.email, 'update_superadmin', 'superadmin', id, name || id, { name, is_active }, req);

    res.json({ message: 'Super admin updated successfully' });

  } catch (error) {
    console.error('Update super admin error:', error);
    res.status(500).json({ error: 'Failed to update super admin' });
  }
};

// Get pending companies
export const getPendingCompanies = async (req, res) => {
  try {
    const [companies] = await query(
      `SELECT * FROM companies 
       WHERE status = ? 
       ORDER BY approval_requested_at DESC`,
      ['pending_approval']
    );

    // Parse JSON fields
    const parsedCompanies = companies.map(company => ({
      ...company,
      settings: company.settings && typeof company.settings === 'string' ? JSON.parse(company.settings) : company.settings,
      industry_features: company.industry_features && typeof company.industry_features === 'string' ? JSON.parse(company.industry_features) : company.industry_features
    }));

    res.json({ success: true, companies: parsedCompanies });

  } catch (error) {
    console.error('Get pending companies error:', error);
    res.status(500).json({ error: 'Failed to fetch pending companies' });
  }
};

// Approve company
export const approveCompany = async (req, res) => {
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

    // Update company status
    await query(
      'UPDATE companies SET status = ?, approved_at = ?, approved_by = ?, updated_at = ? WHERE id = ?',
      ['approved', new Date(), req.user.id, new Date(), companyId]
    );

    // Log audit
    await logAudit(req.user.id, req.user.email, 'approve_company', 'company', companyId, company.company_name, {}, req);

    res.json({
      message: 'Company approved successfully',
      company: { ...company, status: 'approved' }
    });

  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({ error: 'Failed to approve company' });
  }
};

// Reject company
export const rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    // Update company status
    await query(
      'UPDATE companies SET status = ?, rejection_reason = ?, updated_at = ? WHERE id = ?',
      ['rejected', reason, new Date(), companyId]
    );

    // Log audit
    await logAudit(req.user.id, req.user.email, 'reject_company', 'company', companyId, company.company_name, { reason }, req);

    res.json({
      message: 'Company rejected',
      company: { ...company, status: 'rejected' }
    });

  } catch (error) {
    console.error('Reject company error:', error);
    res.status(500).json({ error: 'Failed to reject company' });
  }
};

// Get all users across businesses
export const getAllUsersAcrossBusinesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [users] = await query(
      `SELECT u.*, c.company_name 
       FROM users u 
       LEFT JOIN companies c ON u.company_id = c.id 
       ORDER BY u.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [totalResult] = await query('SELECT COUNT(*) as count FROM users');
    const total = totalResult[0].count;

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(company_name LIKE ? OR email LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [companies] = await query(
      `SELECT * FROM companies ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [totalResult] = await query(
      `SELECT COUNT(*) as count FROM companies ${whereClause}`,
      params
    );

    const total = totalResult[0].count;

    res.json({
      success: true,
      companies,
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

// Block company
export const blockCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Block reason is required' });
    }

    const [companies] = await query('SELECT * FROM companies WHERE id = ?', [companyId]);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    await query(
      'UPDATE companies SET status = ?, updated_at = ? WHERE id = ?',
      ['blocked', new Date(), companyId]
    );

    await logAudit(req.user.id, req.user.email, 'block_company', 'company', companyId, company.company_name, { reason }, req);

    res.json({ message: 'Company blocked successfully' });

  } catch (error) {
    console.error('Block company error:', error);
    res.status(500).json({ error: 'Failed to block company' });
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

    const [companies] = await query('SELECT * FROM companies WHERE id = ?', [companyId]);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    await query(
      'UPDATE companies SET status = ?, updated_at = ? WHERE id = ?',
      ['suspended', new Date(), companyId]
    );

    await logAudit(req.user.id, req.user.email, 'suspend_company', 'company', companyId, company.company_name, { reason }, req);

    res.json({ message: 'Company suspended successfully' });

  } catch (error) {
    console.error('Suspend company error:', error);
    res.status(500).json({ error: 'Failed to suspend company' });
  }
};

// Ban company
export const banCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Ban reason is required' });
    }

    const [companies] = await query('SELECT * FROM companies WHERE id = ?', [companyId]);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    await query(
      'UPDATE companies SET status = ?, updated_at = ? WHERE id = ?',
      ['banned', new Date(), companyId]
    );

    await logAudit(req.user.id, req.user.email, 'ban_company', 'company', companyId, company.company_name, { reason }, req);

    res.json({ message: 'Company banned successfully' });

  } catch (error) {
    console.error('Ban company error:', error);
    res.status(500).json({ error: 'Failed to ban company' });
  }
};

// Reactivate company
export const reactivateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [companies] = await query('SELECT * FROM companies WHERE id = ?', [companyId]);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    await query(
      'UPDATE companies SET status = ?, updated_at = ? WHERE id = ?',
      ['approved', new Date(), companyId]
    );

    await logAudit(req.user.id, req.user.email, 'reactivate_company', 'company', companyId, company.company_name, {}, req);

    res.json({ message: 'Company reactivated successfully' });

  } catch (error) {
    console.error('Reactivate company error:', error);
    res.status(500).json({ error: 'Failed to reactivate company' });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [companies] = await query('SELECT * FROM companies WHERE id = ?', [companyId]);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    // Delete all related data
    await query('DELETE FROM users WHERE company_id = ?', [companyId]);
    await query('DELETE FROM products WHERE company_id = ?', [companyId]);
    await query('DELETE FROM customers WHERE company_id = ?', [companyId]);
    await query('DELETE FROM sales WHERE company_id = ?', [companyId]);
    await query('DELETE FROM invoices WHERE company_id = ?', [companyId]);
    await query('DELETE FROM expenses WHERE company_id = ?', [companyId]);
    await query('DELETE FROM companies WHERE id = ?', [companyId]);

    await logAudit(req.user.id, req.user.email, 'delete_company', 'company', companyId, company.company_name, {}, req);

    res.json({ message: 'Company and all related data deleted successfully' });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await query('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    await query('DELETE FROM users WHERE id = ?', [userId]);

    await logAudit(req.user.id, req.user.email, 'delete_user', 'user', userId, user.username, {}, req);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [companies] = await query('SELECT * FROM companies WHERE id = ?', [companyId]);

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

    // Get statistics
    const [userCount] = await query('SELECT COUNT(*) as count FROM users WHERE company_id = ?', [companyId]);
    const [productCount] = await query('SELECT COUNT(*) as count FROM products WHERE company_id = ?', [companyId]);
    const [salesCount] = await query('SELECT COUNT(*) as count FROM sales WHERE company_id = ?', [companyId]);
    const [totalRevenue] = await query('SELECT SUM(total_amount) as total FROM sales WHERE company_id = ? AND status = ?', [companyId, 'completed']);

    res.json({
      company,
      statistics: {
        userCount: userCount[0].count,
        productCount: productCount[0].count,
        salesCount: salesCount[0].count,
        totalRevenue: totalRevenue[0].total || 0
      }
    });

  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
};

// Get platform statistics
export const getPlatformStatistics = async (req, res) => {
  try {
    // Get total companies by status
    const [totalCompanies] = await query('SELECT COUNT(*) as count FROM companies');
    const [approvedCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['approved']);
    const [pendingCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['pending_approval']);
    const [suspendedCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['suspended']);
    const [blockedCompanies] = await query('SELECT COUNT(*) as count FROM companies WHERE status = ?', ['blocked']);

    // Get total users
    const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');

    // Get total products and sales
    const [totalProducts] = await query('SELECT COUNT(*) as count FROM products');
    const [totalSales] = await query('SELECT COUNT(*) as count FROM sales');
    const [totalRevenue] = await query('SELECT SUM(total_amount) as total FROM sales WHERE status = ?', ['completed']);

    // Get recent activity
    const [recentCompanies] = await query('SELECT * FROM companies ORDER BY created_at DESC LIMIT 5');
    const [recentUsers] = await query('SELECT * FROM users ORDER BY created_at DESC LIMIT 5');

    // Get business type distribution
    const [businessTypes] = await query(
      'SELECT business_type, COUNT(*) as count FROM companies GROUP BY business_type ORDER BY count DESC'
    );

    res.json({
      success: true,
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
      recentActivity: {
        recentCompanies,
        recentUsers
      },
      businessTypes
    });

  } catch (error) {
    console.error('Get platform statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
};
