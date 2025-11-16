/**
 * Log Sanitization Utility
 * SECURITY FIX #16: Remove sensitive data from logs
 */

const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'salt',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'api_key',
  'secret',
  'authorization',
  'cookie',
  'session',
];

/**
 * Recursively sanitize an object, replacing sensitive values
 */
const sanitizeObject = (obj, depth = 0) => {
  // Prevent infinite recursion
  if (depth > 10) return '[MAX_DEPTH]';
  
  if (obj === null || obj === undefined) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  // Handle non-objects (primitives)
  if (typeof obj !== 'object') return obj;
  
  // Handle objects
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if field is sensitive
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Sanitize request for logging
 */
const sanitizeRequest = (req) => {
  return {
    method: req.method,
    url: req.url,
    headers: sanitizeObject(req.headers),
    body: sanitizeObject(req.body),
    query: sanitizeObject(req.query),
    params: req.params,
    ip: req.ip,
    user: req.user ? { id: req.user.id, role: req.user.role } : null,
  };
};

/**
 * Safe logger that sanitizes before logging
 */
const safeLog = (level, message, data = {}) => {
  const sanitized = sanitizeObject(data);
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...sanitized,
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    case 'info':
      console.log(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
};

module.exports = {
  sanitizeObject,
  sanitizeRequest,
  safeLog,
};
