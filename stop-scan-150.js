// Force stop Scan 150
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function stopScan() {
  try {
    console.log('🛑 Force stopping Scan 150...\n');
    
    await pool.query(
      `UPDATE seo_scans 
       SET status = 'failed', 
           scanned_at = NOW() 
       WHERE id = 150`
    );
    
    console.log('✅ Scan 150 STOPPED\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

stopScan();
