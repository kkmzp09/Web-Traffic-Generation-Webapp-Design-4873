#!/bin/bash
cd /root/relay

echo "=== Step 1: Checking seo_scans table structure ==="
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
    console.log('Current columns:', result.rows.map(r => r.column_name).join(', '));
    
    const hasUserId = result.rows.some(r => r.column_name === 'user_id');
    console.log('Has user_id column:', hasUserId);
    
    if (!hasUserId) {
      console.log('Adding user_id column...');
      await pool.query(\`
        ALTER TABLE seo_scans 
        ADD COLUMN user_id UUID REFERENCES users(id)
      \`);
      console.log('✅ user_id column added');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
"

echo ""
echo "=== Step 2: Backing up seo-automation-api.js ==="
cp seo-automation-api.js seo-automation-api.js.backup-user-fix-$(date +%s)

echo ""
echo "=== Step 3: Updating scan endpoints to save user_id ==="
# This will be done in the next step - downloading and editing the file

echo "✅ Database ready. Now updating API..."
