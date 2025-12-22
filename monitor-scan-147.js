// Real-time monitoring for Scan 147
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function monitorScan147() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 MONITORING SCAN 147 - REAL-TIME');
  console.log('='.repeat(80) + '\n');
  
  let lastStatus = null;
  let lastIssueCount = 0;
  let lastFixCount = 0;
  let checkCount = 0;
  
  const interval = setInterval(async () => {
    try {
      checkCount++;
      
      // Check scan status
      const scanResult = await pool.query(
        'SELECT * FROM seo_scans WHERE id = 147'
      );
      
      if (scanResult.rows.length === 0) {
        console.log(`[${new Date().toLocaleTimeString()}] ⏳ Scan 147 not started yet...`);
        return;
      }
      
      const scan = scanResult.rows[0];
      
      // Check issues
      const issuesResult = await pool.query(
        'SELECT COUNT(*) as count FROM seo_issues WHERE scan_id = 147'
      );
      const issueCount = parseInt(issuesResult.rows[0].count);
      
      // Check fixes
      const fixesResult = await pool.query(
        'SELECT COUNT(*) as count FROM seo_fixes WHERE scan_id = 147'
      );
      const fixCount = parseInt(fixesResult.rows[0].count);
      
      // Only log if something changed
      if (scan.status !== lastStatus || issueCount !== lastIssueCount || fixCount !== lastFixCount) {
        console.log(`\n[${new Date().toLocaleTimeString()}] Check #${checkCount}`);
        console.log(`   Status: ${scan.status}`);
        console.log(`   URL: ${scan.url}`);
        console.log(`   SEO Score: ${scan.seo_score || 'calculating...'}/100`);
        console.log(`   Issues Found: ${issueCount}`);
        console.log(`   Auto-Fixes: ${fixCount}`);
        
        if (scan.status === 'completed') {
          console.log(`   Completed At: ${scan.scanned_at}`);
        }
        
        lastStatus = scan.status;
        lastIssueCount = issueCount;
        lastFixCount = fixCount;
      } else {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Check #${checkCount} - Status: ${scan.status}, Issues: ${issueCount}, Fixes: ${fixCount}`);
      }
      
      // If completed, show final details
      if (scan.status === 'completed' && fixCount > 0) {
        console.log('\n\n' + '='.repeat(80));
        console.log('✅ SCAN 147 COMPLETED!');
        console.log('='.repeat(80));
        
        // Get page list
        const pagesResult = await pool.query(
          `SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = 147 ORDER BY page_url`
        );
        
        console.log(`\n📄 Pages Scanned: ${pagesResult.rows.length}`);
        pagesResult.rows.forEach((page, idx) => {
          console.log(`   ${idx + 1}. ${page.page_url}`);
        });
        
        // Get issue breakdown
        const issueBreakdown = await pool.query(
          `SELECT severity, COUNT(*) as count 
           FROM seo_issues 
           WHERE scan_id = 147 
           GROUP BY severity 
           ORDER BY 
             CASE severity 
               WHEN 'critical' THEN 1 
               WHEN 'high' THEN 2 
               WHEN 'warning' THEN 3 
               ELSE 4 
             END`
        );
        
        console.log(`\n🔍 Issue Breakdown:`);
        issueBreakdown.rows.forEach(row => {
          console.log(`   ${row.severity}: ${row.count}`);
        });
        
        // Get fix breakdown
        const fixBreakdown = await pool.query(
          `SELECT i.title, COUNT(*) as count
           FROM seo_fixes f
           JOIN seo_issues i ON f.issue_id = i.id
           WHERE f.scan_id = 147
           GROUP BY i.title
           ORDER BY count DESC
           LIMIT 5`
        );
        
        console.log(`\n🔧 Top Fixes Generated:`);
        fixBreakdown.rows.forEach((row, idx) => {
          console.log(`   ${idx + 1}. ${row.title} (${row.count}x)`);
        });
        
        console.log(`\n🌐 Widget API:`);
        console.log(`   https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=${scan.domain}`);
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ MONITORING COMPLETE');
        console.log('='.repeat(80) + '\n');
        
        clearInterval(interval);
        process.exit(0);
      }
      
      // Timeout after 5 minutes
      if (checkCount > 150) {
        console.log('\n\n⏱️  Monitoring timeout (5 minutes)');
        console.log(`   Last Status: ${scan.status}`);
        console.log(`   Issues: ${issueCount}`);
        console.log(`   Fixes: ${fixCount}`);
        clearInterval(interval);
        process.exit(0);
      }
      
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
    }
  }, 2000); // Check every 2 seconds
}

monitorScan147();
