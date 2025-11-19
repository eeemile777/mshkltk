const jwt = require('jsonwebtoken');

// SECURITY FIX #3: Enforce JWT_SECRET requirement - no fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required for security');
  console.error('Please set JWT_SECRET in your .env file');
  process.exit(1);
}

const JWT_EXPIRATION = '7d'; // Token valid for 7 days

/**
 * Generate a JWT token for a user
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    municipality_id: user.municipality_id,
    portal_access_level: user.portal_access_level,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verify and decode a JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Express middleware to protect routes
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded; // Attach user info to request
  next();
};

/**
 * Middleware to check if user is suspended
 * Must be used after authMiddleware
 */
const checkUserSuspended = async (req, res, next) => {
  try {
    // Skip check for super_admin
    if (req.user && req.user.role === 'super_admin') {
      return next();
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Import here to avoid circular dependency
    const { findUserById } = require('../db/queries/users');
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account suspended', 
        message: 'Your account has been suspended. Please contact an administrator.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking user suspension:', error);
    // Don't block request on error, just log
    next();
  }
};

/**
 * Middleware to check if user has a specific role
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Middleware to check if portal user has write access
 */
const requireWriteAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role === 'super_admin') {
    return next(); // Super admins always have write access
  }

  if (req.user.portal_access_level !== 'read_write') {
    return res.status(403).json({ error: 'Read-only access' });
  }

  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  checkUserSuspended,
  requireRole,
  requireWriteAccess,
};
