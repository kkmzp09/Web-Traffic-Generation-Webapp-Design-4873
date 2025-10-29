#!/bin/bash
cd /root/relay

echo "Adding missing billing columns to subscriptions table..."
echo ""

node -e "
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const sql = fs.readFileSync('add-billing-columns.sql', 'utf8');
    const result = await pool.query(sql);
    
    console.log('✅ Migration completed successfully');
    
    if (result.length > 0) {
      console.log('');
      console.log('📋 Current subscriptions table structure:');
      result[result.length - 1].rows.forEach(col => {
        console.log(\`   • \${col.column_name} (\${col.data_type})\`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
"
