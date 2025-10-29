#!/bin/bash
cd /root/relay

echo "Debugging Neon connection..."
node << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    // Test connection
    const test = await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');
    
    // Check current schema
    const schema = await pool.query('SELECT current_schema()');
    console.log('Current schema:', schema.rows[0].current_schema);
    
    // Check if table exists in any schema
    const tables = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE tablename = 'seo_scans'
    `);
    
    console.log('seo_scans found in schemas:', tables.rows);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
})();
EOF
