#!/usr/bin/env node

const crypto = require('crypto');

function generateRandomKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('🔐 Generate Environment Keys');
console.log('============================\n');

console.log('CSRF_SECRET=' + generateRandomKey(32));
console.log('ENCRYPTION_KEY=' + generateRandomKey(32));
console.log('\n📝 Copy these values to your .env.local file');
console.log('⚠️  Keep these keys secure and never commit them to version control!');
