// Test script to check environment variables
require('dotenv').config();

console.log('PRIVATE_TURSO_DATABASE_URL:', process.env.PRIVATE_TURSO_DATABASE_URL);
console.log('PRIVATE_TURSO_AUTH_TOKEN:', process.env.PRIVATE_TURSO_AUTH_TOKEN ? '***' + process.env.PRIVATE_TURSO_AUTH_TOKEN.slice(-4) : 'undefined');
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? '***' + process.env.TURSO_AUTH_TOKEN.slice(-4) : 'undefined');
