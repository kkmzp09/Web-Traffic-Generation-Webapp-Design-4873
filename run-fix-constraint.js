// Run database fix for seo_monitoring constraint
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixConstraint() {
  try {
    console.log('🔧 Fixing seo_monitoring table constraint...\n');
    
    // Check current constraints
    console.log('📋 Current constraints:');
    const constraints = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'seo_monitoring'
    `);
    console.log(constraints.rows);
    
    // Drop the problematic unique constraint
    console.log('\n🗑️  Dropping seo_monitoring_user_id_key constraint...');
    await pool.query(`
      ALTER TABLE seo_monitoring DROP CONSTRAINT IF EXISTS seo_monitoring_user_id_key
    `);
    console.log('✅ Constraint dropped');
    
    // Verify
    console.log('\n📋 Constraints after fix:');
    const newConstraints = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'seo_monitoring'
    `);
    console.log(newConstraints.rows);
    
    console.log('\n✅ Fix complete! Scans should now work correctly.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixConstraint();
