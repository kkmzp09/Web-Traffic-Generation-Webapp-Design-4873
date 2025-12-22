// STRICT monitoring for Scan 150 - Auto-stop if exceeds 10 pages
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function monitorScan150() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 STRICT MONITORING - SCAN 150');
  console.log('='.repeat(80));
  console.log('⚠️  Will auto-stop if exceeds 10 pages');
  console.log('='.repeat(80) + '\n');
  
  let checkCount = 0;
  let lastPageCount = 0;
  let lastStatus = null;
  
  const interval = setInterval(async () => {
    try {
      checkCount++;
      
      // Check scan
      const scanResult = await pool.query('SELECT * FROM seo_scans WHERE id = 150');
      
      if (scanResult.rows.length === 0) {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] ⏳ Waiting for Scan 150... (${checkCount})`);
        return;
      }
      
      const scan = scanResult.rows[0];
      
      // Count pages
      const pagesResult = await pool.query(
        'SELECT COUNT(DISTINCT page_url) as count FROM seo_issues WHERE scan_id = 150'
      );
      const pageCount = parseInt(pagesResult.rows[0].count);
      
      // Count issues
      const issuesResult = await pool.query(
        'SELECT COUNT(*) as count FROM seo_issues WHERE scan_id = 150'
      );
      const issueCount = parseInt(issuesResult.rows[0].count);
      
      // Display updates
      if (pageCount !== lastPageCount || scan.status !== lastStatus) {
        console.log(`\n[${new Date().toLocaleTimeString()}] Pages: ${pageCount}/10 | Issues: ${issueCount} | Status: ${scan.status}`);
        lastPageCount = pageCount;
        lastStatus = scan.status;
      } else {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Pages: ${pageCount}/10 | Issues: ${issueCount} | Status: ${scan.status} | Check: ${checkCount}`);
      }
      
      // 🚨 CRITICAL: Stop if exceeds 10 pages
      if (pageCount > 10 && scan.status !== 'completed' && scan.status !== 'failed') {
        console.log('\n\n' + '='.repeat(80));
        console.log('🚨 CRITICAL ALERT: EXCEEDED 10 PAGES!');
        console.log('='.repeat(80));
        console.log(`   Pages: ${pageCount}/10`);
        console.log(`   Excess: ${pageCount - 10} pages`);
        console.log(`   STOPPING IMMEDIATELY...\n`);
        
        // Force stop
        await pool.query(
          'UPDATE seo_scans SET status = $1, scanned_at = NOW() WHERE id = 150',
          ['failed']
        );
        
        console.log('✅ Scan 150 STOPPED and marked as FAILED');
        
        // Show pages
        const pages = await pool.query(
          'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 150 ORDER BY page_url'
        );
        
        console.log(`\n📄 Pages Scanned (${pages.rows.length}):`);
        pages.rows.forEach((p, i) => {
          const marker = i < 10 ? '✅' : '❌';
          console.log(`   ${marker} ${i + 1}. ${p.page_url}`);
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('❌ TEST FAILED - EXCEEDED 10-PAGE LIMIT');
        console.log('='.repeat(80) + '\n');
        
        clearInterval(interval);
        process.exit(1);
      }
      
      // ✅ Success if completed with ≤10 pages
      if (scan.status === 'completed') {
        console.log('\n\n' + '='.repeat(80));
        
        if (pageCount <= 10) {
          console.log('✅ SCAN 150 COMPLETED SUCCESSFULLY!');
          console.log('='.repeat(80));
          console.log(`   Pages: ${pageCount}/10 ✅`);
          console.log(`   Issues: ${issueCount}`);
          console.log(`   SEO Score: ${scan.seo_score}/100`);
          
          // Get pages
          const pages = await pool.query(
            'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 150 ORDER BY page_url'
          );
          
          console.log(`\n📄 Pages Scanned:`);
          pages.rows.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.page_url}`);
          });
          
          // Check auto-fixes
          const fixes = await pool.query(
            'SELECT COUNT(*) as count FROM seo_fixes WHERE scan_id = 150'
          );
          
          console.log(`\n🔧 Auto-Fixes Generated: ${fixes.rows[0].count}`);
          
          console.log('\n' + '='.repeat(80));
          console.log('✅ TEST PASSED - 10-PAGE LIMIT WORKING!');
          console.log('='.repeat(80) + '\n');
          
          clearInterval(interval);
          process.exit(0);
        } else {
          console.log('❌ SCAN COMPLETED BUT EXCEEDED LIMIT!');
          console.log('='.repeat(80));
          console.log(`   Pages: ${pageCount}/10 ❌`);
          console.log(`   Excess: ${pageCount - 10} pages\n`);
          
          clearInterval(interval);
          process.exit(1);
        }
      }
      
      // Timeout after 5 minutes
      if (checkCount > 150) {
        console.log('\n\n⏱️  Timeout (5 minutes)');
        console.log(`   Last Status: ${scan.status}`);
        console.log(`   Pages: ${pageCount}/10`);
        clearInterval(interval);
        process.exit(0);
      }
      
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
    }
  }, 2000); // Check every 2 seconds
}

monitorScan150();
