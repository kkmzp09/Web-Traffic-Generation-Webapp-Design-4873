// Add page_url column to seo_fixes table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addPageUrlToFixes() {
  try {
    console.log('📊 Adding page_url column to seo_fixes table...');

    await pool.query(`
      ALTER TABLE seo_fixes
      ADD COLUMN IF NOT EXISTS page_url TEXT
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

addPageUrlToFixes();
