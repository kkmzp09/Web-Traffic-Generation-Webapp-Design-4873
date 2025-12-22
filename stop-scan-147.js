// Force stop Scan 147
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function stopScan() {
  try {
    console.log('🛑 Force stopping Scan 147...\n');
    
    // Update scan status to failed
    await pool.query(
      `UPDATE seo_scans 
       SET status = 'failed', 
           scanned_at = NOW() 
       WHERE id = 147`
    );
    
    console.log('✅ Scan 147 marked as FAILED');
    console.log('✅ Scan stopped\n');
    
    // Show final stats
    const scan = await pool.query('SELECT * FROM seo_scans WHERE id = 147');
    const issues = await pool.query('SELECT COUNT(*) FROM seo_issues WHERE scan_id = 147');
    const pages = await pool.query('SELECT COUNT(DISTINCT page_url) FROM seo_issues WHERE scan_id = 147');
    
    console.log('Final Stats:');
    console.log(`  Status: ${scan.rows[0].status}`);
    console.log(`  Pages: ${pages.rows[0].count}`);
    console.log(`  Issues: ${issues.rows[0].count}`);
    console.log(`  Stopped at: ${scan.rows[0].scanned_at}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

stopScan();
