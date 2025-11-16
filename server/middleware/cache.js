/**
 * API Response Caching Configuration
 * SECURITY FIX #14: Cache static/semi-static data
 */

const NodeCache = require('node-cache');

// Create cache instance with default 10-minute TTL
const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone objects (better performance)
});

/**
 * Cache middleware factory
 * @param {number} duration - Cache duration in seconds (overrides default)
 */
const cacheMiddleware = (duration = null) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // Cache hit
      return res.json(cachedResponse);
    }

    // Cache miss - modify res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, body, duration || undefined);
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate cache by pattern
 */
const invalidateCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  matchingKeys.forEach(key => cache.del(key));
  return matchingKeys.length;
};

/**
 * Clear all cache
 */
const clearCache = () => {
  cache.flushAll();
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache,
  clearCache,
  getCacheStats,
};
