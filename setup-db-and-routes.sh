#!/bin/bash
cd /root/relay

echo "📊 Creating database tables..."
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
echo "✅ Database setup complete!"
