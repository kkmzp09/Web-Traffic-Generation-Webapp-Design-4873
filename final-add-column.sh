#!/bin/bash
cd /root/relay

echo "Adding dataforseo_task_id column to Neon database..."
node << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await pool.query('ALTER TABLE seo_scans ADD COLUMN IF NOT EXISTS dataforseo_task_id VARCHAR(255)');
    await pool.query('ALTER TABLE seo_scans ADD COLUMN IF NOT EXISTS pages_crawled INTEGER DEFAULT 0');
    console.log('✅ Columns added to Neon database');
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
