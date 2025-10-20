const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

/**
 * Generate a random salt
 */
const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Hash a password with a salt using bcrypt
 */
const hashPassword = async (password, salt) => {
  const combinedPassword = password + salt;
  return await bcrypt.hash(combinedPassword, SALT_ROUNDS);
};

/**
 * Verify a password against a hash
 */
const verifyPassword = async (password, salt, hash) => {
  const combinedPassword = password + salt;
  return await bcrypt.compare(combinedPassword, hash);
};

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword,
};
