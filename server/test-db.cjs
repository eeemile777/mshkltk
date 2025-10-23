const { Pool } = require('pg');
require('dotenv').config({ path: '../.env', override: true });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mshkltk',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    console.log('DB Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful! Current time:', result.rows[0]);
    
    // Try to fetch categories
    console.log('\nTesting categories query...');
    const categories = await pool.query('SELECT * FROM dynamic_categories LIMIT 5');
    console.log('✅ Categories query successful! Found', categories.rows.length, 'categories');
    console.log('Sample:', categories.rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
