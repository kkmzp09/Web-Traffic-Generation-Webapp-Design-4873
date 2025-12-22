// Fix seo_fixes table constraints
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixTable() {
  try {
    console.log('🔧 Fixing seo_fixes table constraints...\n');
    
    // Make optimized_content nullable
    console.log('Making optimized_content nullable...');
    await pool.query(`
      ALTER TABLE seo_fixes 
      ALTER COLUMN optimized_content DROP NOT NULL
    `);
    console.log('✅ optimized_content is now nullable');
    
    // Make original_content nullable
    console.log('\nMaking original_content nullable...');
    await pool.query(`
      ALTER TABLE seo_fixes 
      ALTER COLUMN original_content DROP NOT NULL
    `);
    console.log('✅ original_content is now nullable');
    
    console.log('\n✅ Table constraints fixed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixTable();
