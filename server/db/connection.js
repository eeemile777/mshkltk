const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), override: true });

// SECURITY FIX #17: Environment-based database pool configuration
const pool = new Pool({
  // For local development with PostgreSQL
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mshkltk',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  
  // For Google Cloud SQL (when deployed)
  // Uncomment and configure when you set up Cloud SQL
  // host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
  
  // Connection pool settings with environment overrides
  max: parseInt(process.env.DB_POOL_MAX) || 20, // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN) || 5, // Minimum number of clients
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000, // Return error after 2 seconds if connection cannot be established
  
  // Retry configuration
  maxUses: 7500, // Close and replace client after 7500 queries
  allowExitOnIdle: process.env.NODE_ENV === 'development', // Allow process to exit with idle clients in dev
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Only log slow queries (over 100ms) or in verbose mode
    if (duration > 100 || process.env.DEBUG_QUERIES === 'true') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool for transactions
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds for queries within transactions
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  
  return client;
};

module.exports = {
  query,
  getClient,
  pool, // Export pool for graceful shutdown
};
