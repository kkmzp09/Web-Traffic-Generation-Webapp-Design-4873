// Run this on server to create database tables
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('📊 Creating database tables...');

const sql = fs.readFileSync('create-monitoring-tables.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('✅ All tables created successfully!');
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error creating tables:', err.message);
    pool.end();
    process.exit(1);
  });
