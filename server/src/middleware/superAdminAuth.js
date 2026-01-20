import jwt from 'jsonwebtoken';

export const superAdminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.warn('Super admin auth failed: No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log decoded token info for debugging
    console.log('Super admin auth - Token decoded:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isSuperAdmin: decoded.isSuperAdmin,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
    });
    
    console.log('Super admin auth - Role check:', {
      hasIsSuperAdmin: !!decoded.isSuperAdmin,
      isSuperAdminValue: decoded.isSuperAdmin,
      roleValue: decoded.role,
      roleIsSuperadmin: decoded.role === 'superadmin',
      willPass: decoded.isSuperAdmin === true || decoded.role === 'superadmin'
    });

    // Check if user is super admin (multiple ways to be more permissive)
    const isSuperAdmin = decoded.isSuperAdmin === true || 
                         decoded.isSuperAdmin === 'true' || 
                         decoded.role === 'superadmin' ||
                         decoded.email === 'superadmin@saptech.com';
    
    if (!isSuperAdmin) {
      console.warn('Super admin auth failed: User is not super admin', {
        role: decoded.role,
        isSuperAdmin: decoded.isSuperAdmin,
        email: decoded.email,
        decodedKeys: Object.keys(decoded)
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin privileges required.' 
      });
    }

    // Add user info to request
    req.user = decoded;
    req.superAdmin = decoded;
    console.log('Super admin auth successful for:', decoded.email);
    next();

  } catch (error) {
    console.error('Super admin auth error:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired, please login again' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format, authorization denied' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token, authorization denied' 
    });
  }
};

// Alias for compatibility
export const authenticateSuperAdmin = superAdminAuth;

// Check specific permissions
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.isSuperAdmin) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
      }

      // Super admins have all permissions by default
      // This middleware can be extended to check granular permissions if needed
      next();

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Permission check failed' 
      });
    }
  };
};
