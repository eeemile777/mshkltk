const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;
const password = 'password';
const salt = 'salt123'; // Using the same salt as in the seed file

const generateHash = async () => {
    const combinedPassword = password + salt;
    const hash = await bcrypt.hash(combinedPassword, SALT_ROUNDS);
    console.log('HASH:', hash);
};

generateHash();
