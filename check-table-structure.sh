#!/bin/bash
cd /root/relay

# Check the seo_scans table structure
node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query(\`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'seo_scans'
      ORDER BY ordinal_position
    \`);
    console.log('seo_scans table columns:');
    result.rows.forEach(row => {
      console.log(\`  - \${row.column_name} (\${row.data_type})\`);
    });
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
"
