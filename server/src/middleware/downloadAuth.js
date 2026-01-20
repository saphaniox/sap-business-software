import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';

/**
 * Authentication middleware for download endpoints
 * Accepts token from either Authorization header OR query parameter
 * This is needed because window.open() cannot set custom headers
 */
export async function authenticateDownload(req, res, next) {
  // Try to get token from header first, then from query parameter
  let token = req.headers.authorization?.split(' ')[1];
  
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // SECURITY: Require JWT_SECRET from environment, no fallback
    if (!process.env.JWT_SECRET) {
      console.error('🚨 CRITICAL: JWT_SECRET not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data from database to get current role
    const result = await query(
      'SELECT id, username, role, company_id, status FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if user account is active
    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({ 
        error: 'Your account has been suspended. Please contact support.' 
      });
    }
    
    // Use current role from database, not from token
    // CRITICAL: Include company_id for data isolation
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      company_id: user.company_id,
      loginTime: decoded.iat * 1000
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Download auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
