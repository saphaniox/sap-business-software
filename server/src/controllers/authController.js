import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  validateEmail, 
  validatePasswordStrength
} from '../middleware/securityEnhancements.js';

export async function register(req, res) {
  const { username, email, password, company_id } = req.body;

  try {
    // SECURITY: Validate required fields
    if (!company_id) {
      return res.status(400).json({ 
        error: 'Oops! We need your Business ID. Please register your business first, then come back to create your account! 🏢' 
      });
    }

    // SECURITY: Validate email format
    if (email && !validateEmail(email)) {
      return res.status(400).json({ 
        error: 'This email address doesn\'t seem valid. Mind checking it again? 📧' 
      });
    }

    // SECURITY: Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // SECURITY: Verify business exists and is active
    const companyResult = await query(
      'SELECT * FROM companies WHERE id = ? AND status = ?',
      [company_id, 'active']
    );
    const company = companyResult.rows[0];

    if (!company) {
      return res.status(404).json({ 
        error: 'We couldn\'t find this business or it might be inactive. 🔍 Please reach out to your administrator for help!' 
      });
    }

    // SECURITY: Check if user already exists within THIS business only
    // Users can have same email in different businesses (isolated)
    const existingResult = await query(
      'SELECT * FROM users WHERE email = ? AND company_id = ?',
      [email, company_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'This email is already taken in your company. Try a different one? 😊' 
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 12); // Increased cost from 10 to 12
    const userId = uuidv4();
    
    await query(
      `INSERT INTO users (id, company_id, name, email, password, role, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, company_id, username, email, hashedPassword, 'sales', 'active']
    );

    const newUser = {
      id: userId,
      company_id,
      name: username,
      email,
      role: 'sales'
    };

    // SECURITY: Require JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('🚨 CRITICAL: JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { 
        id: userId, 
        company_id,
        username, 
        role: 'sales',
        is_company_admin: false
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Reduced from 7d to 24h for better security
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      company: {
        id: company.id,
        name: company.company_name
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  const { username, password, companyName } = req.body;

  try {
    // If company name provided, find company first
    let companyId = null;
    if (companyName) {
      const companyResult = await query(
        'SELECT * FROM companies WHERE LOWER(company_name) = LOWER(?)',
        [companyName]
      );

      if (companyResult.rows.length === 0) {
        return res.status(401).json({ 
          error: 'Company not found. Please check the company name.' 
        });
      }

      companyId = companyResult.rows[0].id;
    }

    // Find user by email (username field is used for email input)
    let userResult;
    if (companyId) {
      userResult = await query(
        'SELECT * FROM users WHERE email = ? AND company_id = ?',
        [username, companyId]
      );
    } else {
      userResult = await query(
        'SELECT * FROM users WHERE email = ?',
        [username]
      );
    }
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ 
        error: 'Email not found. Please check your credentials and try again.' 
      });
    }

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.password || user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        error: 'Incorrect password. Please try again.' 
      });
    }

    // Get company details
    const companyResult = await query(
      'SELECT * FROM companies WHERE id = ?',
      [user.company_id]
    );
    const company = companyResult.rows[0];

    if (!company) {
      return res.status(404).json({
        error: 'Company not found. Please contact support.'
      });
    }

    // Check if company is pending approval
    if (company.status === 'pending_approval') {
      return res.status(403).json({
        error: 'pending_approval',
        message: 'Your business account is pending admin approval.',
        company: {
          id: company.id,
          name: company.company_name,
          status: 'pending_approval',
          requested_at: company.approval_requested_at
        },
        user: {
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }

    // Check if company is rejected
    if (company.status === 'rejected') {
      return res.status(403).json({
        error: 'account_rejected',
        message: 'Your business registration was not approved.',
        reason: company.rejection_reason || 'Not specified',
        rejected_at: company.rejected_at
      });
    }

    // Check if company is blocked
    if (company.status === 'blocked') {
      return res.status(403).json({
        error: 'account_blocked',
        message: 'Your business account has been blocked.',
        reason: company.block_reason || 'Policy violation',
        blocked_at: company.blocked_at,
        contact: 'Please contact support for more information.'
      });
    }

    // Check if company is suspended
    if (company.status === 'suspended') {
      const suspendedUntil = company.suspended_until 
        ? new Date(company.suspended_until) 
        : null;
      
      // Check if suspension has expired
      if (suspendedUntil && suspendedUntil < new Date()) {
        // Auto-reactivate if suspension period is over
        await query(
          `UPDATE companies 
           SET status = 'active', updated_at = NOW(), 
               suspended_at = NULL, suspended_by = NULL, 
               suspension_reason = NULL, suspended_until = NULL
           WHERE id = ?`,
          [company.id]
        );
      } else {
        return res.status(403).json({
          error: 'account_suspended',
          message: 'Your business account is temporarily suspended.',
          reason: company.suspension_reason || 'Policy violation',
          suspended_at: company.suspended_at,
          suspended_until: suspendedUntil,
          contact: 'Please contact support for more information.'
        });
      }
    }

    // Check if company is banned
    if (company.status === 'banned') {
      return res.status(403).json({
        error: 'account_banned',
        message: 'Your business account has been permanently banned.',
        reason: company.ban_reason || 'Serious policy violation',
        banned_at: company.banned_at,
        contact: 'This action is permanent. Contact support if you believe this is an error.'
      });
    }

    // Check if company is inactive
    if (company.status !== 'active') {
      return res.status(403).json({
        error: 'account_inactive',
        message: 'Your business account is inactive. Please contact support.'
      });
    }

    // SECURITY: Require JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('🚨 CRITICAL: JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        company_id: user.company_id,
        username: user.username, 
        role: user.role,
        is_company_admin: user.is_company_admin || false
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        is_company_admin: user.is_company_admin || false
      },
      company: {
        id: company.id,
        name: company.company_name,
        business_type: company.business_type
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
}
