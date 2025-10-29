#!/bin/bash
# Setup script for Keyword Tracker

echo "🚀 Setting up Keyword Tracker..."

# 1. Create database tables
echo "📊 Creating database tables..."
cd /root/relay

node << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', (client) => {
  client.query('SET search_path TO public');
});

(async () => {
  try {
    console.log('Creating keyword tracker tables...');
    
    const schema = fs.readFileSync('./keyword-tracker-schema.sql', 'utf8');
    await pool.query(schema);
    
    console.log('✅ Database tables created successfully!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
EOF

echo ""
echo "✅ Keyword Tracker setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart the API: pm2 restart relay-api"
echo "2. Test the endpoints"
echo ""
