#!/bin/bash
cd /root/relay

echo "Getting latest scan..."
node << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', (client) => {
  client.query('SET search_path TO public');
});

(async () => {
  try {
    const result = await pool.query('SELECT id, url, status, dataforseo_task_id, created_at FROM seo_scans ORDER BY created_at DESC LIMIT 1');
    console.log('Latest scan:', JSON.stringify(result.rows[0], null, 2));
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
})();
EOF
