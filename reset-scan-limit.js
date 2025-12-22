// Reset scan limit for testing
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetLimit() {
  try {
    const userId = '00000000-0000-0000-0000-000000000000';
    
    console.log('🔧 Resetting scan limit for testing...\n');
    
    // Delete monitoring records for this month
    const result = await pool.query(
      `DELETE FROM seo_monitoring 
       WHERE user_id = $1 
       AND measured_at >= date_trunc('month', CURRENT_DATE)`,
      [userId]
    );
    
    console.log(`✅ Deleted ${result.rowCount} monitoring records`);
    console.log('✅ Scan limit reset - you can now scan again!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetLimit();
