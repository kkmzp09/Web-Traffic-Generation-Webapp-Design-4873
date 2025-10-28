// Add site_id column to user_websites table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addSiteIdColumn() {
  try {
    console.log('📊 Adding site_id column to user_websites table...');

    await pool.query(`
      ALTER TABLE user_websites
      ADD COLUMN IF NOT EXISTS site_id VARCHAR(255) UNIQUE
    `);

    console.log('✅ Column added successfully!');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addSiteIdColumn();
