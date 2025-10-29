#!/bin/bash
cd /root/relay

echo "Adding columns to Neon seo_scans table..."
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
    
    await client.query('ALTER TABLE seo_scans ADD COLUMN IF NOT EXISTS dataforseo_task_id VARCHAR(255)');
    await client.query('ALTER TABLE seo_scans ADD COLUMN IF NOT EXISTS pages_crawled INTEGER DEFAULT 0');
    
    console.log('✅ Columns added to Neon database');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
})();
EOF

echo ""
echo "Restarting API..."
pm2 restart relay-api

sleep 3
echo ""
echo "Testing API..."
curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","maxPages":1}'
