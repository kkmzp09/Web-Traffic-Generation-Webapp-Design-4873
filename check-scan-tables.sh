#!/bin/bash
cd /root/relay

echo "Checking for scan-related tables..."
node << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%scan%'
      ORDER BY table_name
    `);
    
    console.log('📋 Scan-related tables:');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    if (result.rows.length === 0) {
      console.log('  (none found)');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
EOF
