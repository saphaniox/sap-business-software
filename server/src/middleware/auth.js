import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
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
      'SELECT id, name, email, role, company_id, status FROM users WHERE id = ?',
      [decoded.id]
    );
    const user = result[0];
    
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
      role: user.role, // Fresh role from database
      company_id: user.company_id, // REQUIRED for tenant context
      loginTime: decoded.iat * 1000 // Convert to milliseconds
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  };
}
