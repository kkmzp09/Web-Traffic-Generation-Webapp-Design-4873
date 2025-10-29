#!/bin/bash
cd /root/relay

echo "Checking DATABASE_URL in .env..."
grep "DATABASE_URL" .env | head -1 | sed 's/:.*/:[REDACTED]/'

echo ""
echo "Testing database connection..."
node -e "
require('dotenv').config();
const { Pool } = require('pg');

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].now);
    await pool.end();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    await pool.end();
  }
})();
"
