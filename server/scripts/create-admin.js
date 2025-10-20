#!/usr/bin/env node

/**
 * Script to create the miloadmin super admin user
 * Usage: node create-admin.js
 */

const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/connection');
const { generateSalt, hashPassword } = require('../utils/crypto');

async function createAdminUser() {
  const username = 'miloadmin';
  const password = 'admin123'; // You should change this after first login!
  
  console.log('🔐 Creating super admin user...');
  
  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('❌ User "miloadmin" already exists!');
      console.log('💡 Deleting existing user and creating a new one...');
      await query('DELETE FROM users WHERE username = $1', [username]);
    }
    
    // Generate salt and hash password using the same method as the server
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    
    // Create the admin user
    const userId = uuidv4();
    const result = await query(
      `INSERT INTO users (
        id, username, password_hash, salt, role,
        portal_access_level, display_name, points, municipality_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, username, role, portal_access_level`,
      [
        userId,
        username,
        passwordHash,
        salt,
        'super_admin',
        'read_write',
        'System Administrator',
        0,
        'all'
      ]
    );
    
    console.log('✅ Super admin user created successfully!');
    console.log('📋 User details:');
    console.log('   ID:', result.rows[0].id);
    console.log('   Username:', result.rows[0].username);
    console.log('   Role:', result.rows[0].role);
    console.log('   Portal Access:', result.rows[0].portal_access_level);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Username: miloadmin');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
