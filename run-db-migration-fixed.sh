#!/bin/bash
cd /root/relay

echo "Running database migration..."
node << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const sql = fs.readFileSync('add-dataforseo-columns.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Database migration completed');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
EOF
