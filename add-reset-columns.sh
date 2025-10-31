#!/bin/bash
cd /var/www/auth-api

echo "Adding reset_token columns to users table..."

node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await pool.query(\`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
    \`);
    
    console.log('✅ Columns added successfully');
    
    // Verify columns exist
    const result = await pool.query(\`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name LIKE 'reset%'
    \`);
    
    console.log('Reset columns in users table:', result.rows.map(r => r.column_name));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
"
