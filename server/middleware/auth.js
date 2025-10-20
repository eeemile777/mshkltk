const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
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
  requireRole,
  requireWriteAccess,
};
