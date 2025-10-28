// Add pages_scanned and pages_skipped columns to seo_scans table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addColumns() {
  try {
    console.log('📊 Adding columns to seo_scans table...');

    await pool.query(`
      ALTER TABLE seo_scans 
      ADD COLUMN IF NOT EXISTS pages_scanned INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pages_skipped INTEGER DEFAULT 0
    `);

    console.log('✅ Columns added successfully!');

    // Update existing records
    await pool.query(`
      UPDATE seo_scans 
      SET pages_scanned = 1, pages_skipped = 0 
      WHERE pages_scanned IS NULL OR pages_scanned = 0
    `);

    console.log('✅ Existing records updated!');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addColumns();
