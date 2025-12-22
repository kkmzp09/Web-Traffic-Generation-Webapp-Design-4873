// Check Scan 150 status
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkScan150() {
  try {
    const scan = await pool.query('SELECT * FROM seo_scans WHERE id = 150');
    
    if (scan.rows.length === 0) {
      console.log('❌ Scan 150 not found - not started yet');
      process.exit(0);
    }
    
    const pages = await pool.query(
      'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 150'
    );
    
    const issues = await pool.query(
      'SELECT COUNT(*) FROM seo_issues WHERE scan_id = 150'
    );
    
    console.log('\n📊 SCAN 150 STATUS:\n');
    console.log(`URL: ${scan.rows[0].url}`);
    console.log(`Status: ${scan.rows[0].status}`);
    console.log(`Pages: ${pages.rows.length}/10`);
    console.log(`Issues: ${issues.rows[0].count}`);
    console.log(`SEO Score: ${scan.rows[0].seo_score || 'calculating...'}\n`);
    
    if (pages.rows.length > 0) {
      console.log('Pages Scanned:');
      pages.rows.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.page_url}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkScan150();
