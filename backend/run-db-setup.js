// Run PhonePe database setup
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('📊 Creating PhonePe payment tables...');
    
    const sql = fs.readFileSync('setup-phonepe-tables.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✅ Database tables created successfully!');
    console.log('✅ Tables created: payments');
    console.log('✅ Indexes created: 4 indexes');
    console.log('✅ Column added to subscriptions: payment_id');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
