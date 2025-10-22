/**
 * Database module - exports pool and query helper
 */
const pool = require('./connection');

// Export query helper for convenience
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};
