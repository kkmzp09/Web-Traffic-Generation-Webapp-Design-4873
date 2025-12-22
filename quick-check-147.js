// Quick check Scan 147
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function quickCheck() {
  try {
    // Check scan
    const scan = await pool.query('SELECT * FROM seo_scans WHERE id = 147');
    
    if (scan.rows.length === 0) {
      console.log('❌ Scan 147 not found');
      process.exit(0);
    }
    
    console.log('\n📊 SCAN 147 STATUS:\n');
    console.log(`URL: ${scan.rows[0].url}`);
    console.log(`Status: ${scan.rows[0].status}`);
    console.log(`SEO Score: ${scan.rows[0].seo_score || 'calculating...'}`);
    console.log(`Created: ${scan.rows[0].created_at}`);
    
    // Count pages
    const pages = await pool.query(
      'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 147'
    );
    
    console.log(`\n📄 PAGES SCANNED: ${pages.rows.length}`);
    pages.rows.forEach((p, i) => {
      console.log(`${i + 1}. ${p.page_url}`);
    });
    
    // Count issues
    const issues = await pool.query(
      'SELECT COUNT(*) FROM seo_issues WHERE scan_id = 147'
    );
    console.log(`\n🔍 Total Issues: ${issues.rows[0].count}`);
    
    // Count fixes
    const fixes = await pool.query(
      'SELECT COUNT(*) FROM seo_fixes WHERE scan_id = 147'
    );
    console.log(`🔧 Total Fixes: ${fixes.rows[0].count}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

quickCheck();
