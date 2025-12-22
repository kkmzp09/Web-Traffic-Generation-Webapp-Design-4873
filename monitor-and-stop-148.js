// Monitor Scan 148 and auto-stop if exceeds 10 pages
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function monitorScan148() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 MONITORING SCAN 148 - AUTO-STOP IF EXCEEDS 10 PAGES');
  console.log('='.repeat(80) + '\n');
  
  let checkCount = 0;
  let lastPageCount = 0;
  
  const interval = setInterval(async () => {
    try {
      checkCount++;
      
      // Check if scan exists
      const scanResult = await pool.query('SELECT * FROM seo_scans WHERE id = 148');
      
      if (scanResult.rows.length === 0) {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] ⏳ Waiting for Scan 148 to start... (${checkCount})`);
        return;
      }
      
      const scan = scanResult.rows[0];
      
      // Count unique pages
      const pagesResult = await pool.query(
        'SELECT COUNT(DISTINCT page_url) as count FROM seo_issues WHERE scan_id = 148'
      );
      const pageCount = parseInt(pagesResult.rows[0].count);
      
      // Count issues
      const issuesResult = await pool.query(
        'SELECT COUNT(*) as count FROM seo_issues WHERE scan_id = 148'
      );
      const issueCount = parseInt(issuesResult.rows[0].count);
      
      // Display status
      if (pageCount !== lastPageCount) {
        console.log(`\n[${new Date().toLocaleTimeString()}] Status: ${scan.status}`);
        console.log(`   Pages: ${pageCount}/10`);
        console.log(`   Issues: ${issueCount}`);
        lastPageCount = pageCount;
      } else {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Pages: ${pageCount}/10 | Issues: ${issueCount} | Status: ${scan.status}`);
      }
      
      // 🚨 STOP IF EXCEEDS 10 PAGES
      if (pageCount > 10 && scan.status !== 'completed' && scan.status !== 'failed') {
        console.log('\n\n' + '='.repeat(80));
        console.log('🚨 ALERT: SCAN EXCEEDED 10 PAGES!');
        console.log('='.repeat(80));
        console.log(`   Pages scanned: ${pageCount}`);
        console.log(`   Limit: 10`);
        console.log(`   Excess: ${pageCount - 10} pages\n`);
        
        console.log('🛑 STOPPING SCAN 148...');
        
        await pool.query(
          `UPDATE seo_scans 
           SET status = 'failed', 
               scanned_at = NOW() 
           WHERE id = 148`
        );
        
        console.log('✅ Scan 148 stopped and marked as FAILED\n');
        
        // Show pages scanned
        const pages = await pool.query(
          'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 148 ORDER BY page_url'
        );
        
        console.log(`📄 Pages Scanned (${pages.rows.length}):`);
        pages.rows.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.page_url}`);
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('❌ SCAN STOPPED DUE TO PAGE LIMIT VIOLATION');
        console.log('='.repeat(80) + '\n');
        
        clearInterval(interval);
        process.exit(1);
      }
      
      // ✅ SUCCESS IF COMPLETED WITH 10 OR FEWER PAGES
      if (scan.status === 'completed') {
        console.log('\n\n' + '='.repeat(80));
        
        if (pageCount <= 10) {
          console.log('✅ SCAN 148 COMPLETED SUCCESSFULLY!');
          console.log('='.repeat(80));
          console.log(`   Pages: ${pageCount}/10 ✅`);
          console.log(`   Issues: ${issueCount}`);
          console.log(`   SEO Score: ${scan.seo_score}/100`);
          
          // Show pages
          const pages = await pool.query(
            'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 148 ORDER BY page_url'
          );
          
          console.log(`\n📄 Pages Scanned:`);
          pages.rows.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.page_url}`);
          });
          
          // Check auto-fixes
          const fixes = await pool.query(
            'SELECT COUNT(*) as count FROM seo_fixes WHERE scan_id = 148'
          );
          
          console.log(`\n🔧 Auto-Fixes Generated: ${fixes.rows[0].count}`);
          
          console.log('\n' + '='.repeat(80));
          console.log('✅ 10-PAGE LIMIT WORKING CORRECTLY!');
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
        console.log('\n\n⏱️  Monitoring timeout (5 minutes)');
        console.log(`   Last Status: ${scan.status}`);
        console.log(`   Pages: ${pageCount}`);
        clearInterval(interval);
        process.exit(0);
      }
      
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
    }
  }, 2000); // Check every 2 seconds
}

monitorScan148();
