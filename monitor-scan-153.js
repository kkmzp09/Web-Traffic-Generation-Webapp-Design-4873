// Monitor Scan 153 - Real-time tracking
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function monitorScan153() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 MONITORING SCAN 153');
  console.log('='.repeat(80) + '\n');
  
  let checkCount = 0;
  let lastPageCount = 0;
  let lastStatus = null;
  
  const interval = setInterval(async () => {
    try {
      checkCount++;
      
      const scan = await pool.query('SELECT * FROM seo_scans WHERE id = 153');
      
      if (scan.rows.length === 0) {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] ⏳ Waiting for Scan 153... (${checkCount})`);
        return;
      }
      
      const scanData = scan.rows[0];
      
      const pages = await pool.query(
        'SELECT COUNT(DISTINCT page_url) as count FROM seo_issues WHERE scan_id = 153'
      );
      const pageCount = parseInt(pages.rows[0].count);
      
      const issues = await pool.query(
        'SELECT COUNT(*) as count FROM seo_issues WHERE scan_id = 153'
      );
      const issueCount = parseInt(issues.rows[0].count);
      
      if (pageCount !== lastPageCount || scanData.status !== lastStatus) {
        console.log(`\n[${new Date().toLocaleTimeString()}] Pages: ${pageCount}/10 | Issues: ${issueCount} | Status: ${scanData.status}`);
        lastPageCount = pageCount;
        lastStatus = scanData.status;
      } else {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Pages: ${pageCount}/10 | Issues: ${issueCount} | Status: ${scanData.status}`);
      }
      
      // Alert if exceeds 10 pages
      if (pageCount > 10 && scanData.status !== 'completed' && scanData.status !== 'failed') {
        console.log('\n\n🚨 ALERT: EXCEEDED 10 PAGES!');
        console.log(`   Pages: ${pageCount}/10`);
        console.log(`   Stopping scan...\n`);
        
        await pool.query(
          'UPDATE seo_scans SET status = $1, scanned_at = NOW() WHERE id = 153',
          ['failed']
        );
        
        console.log('✅ Scan 153 stopped\n');
        clearInterval(interval);
        process.exit(1);
      }
      
      if (scanData.status === 'completed') {
        console.log('\n\n' + '='.repeat(80));
        console.log('✅ SCAN 153 COMPLETED');
        console.log('='.repeat(80));
        
        const finalPages = await pool.query(
          'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 153 ORDER BY page_url'
        );
        
        const fixes = await pool.query(
          'SELECT COUNT(*) as count FROM seo_fixes WHERE scan_id = 153'
        );
        
        console.log(`\nURL: ${scanData.url}`);
        console.log(`SEO Score: ${scanData.seo_score}/100`);
        console.log(`Pages: ${finalPages.rows.length}/10`);
        console.log(`Issues: ${issueCount}`);
        console.log(`Auto-Fixes: ${fixes.rows[0].count}\n`);
        
        console.log('Pages Scanned:');
        finalPages.rows.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.page_url}`);
        });
        
        console.log('\n' + '='.repeat(80));
        if (finalPages.rows.length <= 10) {
          console.log('✅ TEST PASSED - 10-PAGE LIMIT WORKING!');
        } else {
          console.log('❌ TEST FAILED - EXCEEDED 10 PAGES!');
        }
        console.log('='.repeat(80) + '\n');
        
        clearInterval(interval);
        process.exit(0);
      }
      
      if (checkCount > 150) {
        console.log('\n\n⏱️  Timeout (5 minutes)');
        console.log(`   Last Status: ${scanData.status}`);
        console.log(`   Pages: ${pageCount}/10\n`);
        clearInterval(interval);
        process.exit(0);
      }
      
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
    }
  }, 2000);
}

monitorScan153();
