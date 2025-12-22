// Clear monthly monitoring records to allow more scans
// This effectively gives you unlimited scans for testing
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clearLimit() {
  try {
    const userId = '00000000-0000-0000-0000-000000000000';
    
    console.log('🔧 Clearing monthly scan limit for testing...\n');
    
    // Delete all monitoring records for this month
    const result = await pool.query(
      `DELETE FROM seo_monitoring 
       WHERE user_id = $1 
       AND measured_at >= date_trunc('month', CURRENT_DATE)`,
      [userId]
    );
    
    console.log(`✅ Deleted ${result.rowCount} monitoring records`);
    console.log('✅ Monthly limit reset!\n');
    
    console.log('📊 Current Status:');
    console.log('   - Monthly pages used: 0/500');
    console.log('   - Per-scan limit: 10 pages');
    console.log('   - You can now run 50 more scans\n');
    
    console.log('💡 Note: Run this script anytime you hit the monthly limit during testing\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearLimit();
