// Check if autofix_verifications table was created in Neon DB
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTable() {
  try {
    console.log('\n🔍 Checking Neon Database...\n');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'autofix_verifications'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Table "autofix_verifications" EXISTS in Neon DB\n');
      
      // Get table structure
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'autofix_verifications'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Table Structure:\n');
      structure.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Check indexes
      const indexes = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'autofix_verifications';
      `);
      
      console.log('\n📋 Indexes:\n');
      indexes.rows.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
      
      // Count records
      const count = await pool.query('SELECT COUNT(*) FROM autofix_verifications');
      console.log(`\n📊 Current Records: ${count.rows[0].count}\n`);
      
    } else {
      console.log('❌ Table "autofix_verifications" does NOT exist in Neon DB\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTable();
