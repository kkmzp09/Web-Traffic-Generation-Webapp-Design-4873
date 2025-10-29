#!/bin/bash
cd /root/relay

echo "Checking seo_scans table structure..."
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
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'seo_scans'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 seo_scans columns:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
})();
EOF
