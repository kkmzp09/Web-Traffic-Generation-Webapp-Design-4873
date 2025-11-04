// Update database for guest user support
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateDatabase() {
  try {
    console.log('📊 Updating payments table for guest user support...');
    
    const sql = fs.readFileSync('update-payments-for-guests.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✅ Database updated successfully!');
    console.log('✅ user_id is now nullable');
    console.log('✅ guest_email column added');
    console.log('✅ guest_name column added');
    console.log('✅ Index created for guest_email');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database update error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateDatabase();
