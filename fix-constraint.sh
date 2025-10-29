#!/bin/bash
cd /root/relay

echo "Removing NOT NULL constraint from user_id..."
node << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const client = await pool.connect();
    await client.query('SET search_path TO public');
    
    await client.query('ALTER TABLE seo_scans ALTER COLUMN user_id DROP NOT NULL');
    
    console.log('✅ user_id constraint removed');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
})();
EOF

echo ""
echo "Testing API..."
sleep 2

curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d '{"url":"https://example.com","maxPages":1}'
