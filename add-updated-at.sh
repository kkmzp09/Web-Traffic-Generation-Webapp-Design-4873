#!/bin/bash
cd /root/relay

echo "Adding updated_at column..."
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
    
    await client.query('ALTER TABLE seo_scans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()');
    
    console.log('✅ updated_at column added');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
})();
EOF

echo ""
echo "Restarting and testing..."
pm2 restart relay-api
sleep 3

curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","maxPages":1}'
