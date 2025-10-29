#!/bin/bash
# Check discount codes in database

cd /root/relay

node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query('SELECT * FROM discount_codes');
    console.log('📋 Discount Codes in Database:');
    console.log(JSON.stringify(result.rows, null, 2));
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
})();
"
