#!/bin/bash
cd /root/relay

echo "Creating seo_scans table..."
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
    const sql = fs.readFileSync('create-seo-scans-table.sql', 'utf8');
    const result = await pool.query(sql);
    console.log('✅', result.rows[0].status);
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
EOF
