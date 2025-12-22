// Add fix_code column to seo_fixes table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addFixCodeColumn() {
  try {
    console.log('🔧 Checking seo_fixes table structure...\n');
    
    // Check current columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'seo_fixes'
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // Add fix_code column if it doesn't exist
    console.log('\n🔧 Adding fix_code column...');
    await pool.query(`
      ALTER TABLE seo_fixes 
      ADD COLUMN IF NOT EXISTS fix_code TEXT
    `);
    
    console.log('✅ fix_code column added');
    
    // Verify
    const newColumnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'seo_fixes'
      ORDER BY ordinal_position
    `);
    
    console.log('\nUpdated columns:');
    newColumnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    console.log('\n✅ Table structure updated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addFixCodeColumn();
