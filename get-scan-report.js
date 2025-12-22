// Get detailed scan report from database
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getScanReport(scanId) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 DETAILED SCAN REPORT - Scan ID: ${scanId}`);
    console.log('='.repeat(80));
    
    // Get scan details
    const scanResult = await pool.query(
      'SELECT * FROM seo_scans WHERE id = $1',
      [scanId]
    );
    
    if (scanResult.rows.length === 0) {
      console.log('❌ Scan not found');
      return;
    }
    
    const scan = scanResult.rows[0];
    console.log('\n📋 SCAN OVERVIEW:');
    console.log(`   URL: ${scan.url}`);
    console.log(`   Status: ${scan.status}`);
    console.log(`   SEO Score: ${scan.seo_score || 'calculating...'}/100`);
    console.log(`   Started: ${scan.created_at}`);
    console.log(`   Completed: ${scan.scanned_at || 'in progress...'}`);
    
    // Get all issues
    const issuesResult = await pool.query(
      `SELECT * FROM seo_issues 
       WHERE scan_id = $1 
       ORDER BY 
         CASE severity 
           WHEN 'critical' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'medium' THEN 3 
           WHEN 'low' THEN 4 
         END,
         page_url`,
      [scanId]
    );
    
    const issues = issuesResult.rows;
    
    console.log(`\n📈 STATISTICS:`);
    console.log(`   Total Issues: ${issues.length}`);
    console.log(`   Critical: ${issues.filter(i => i.severity === 'critical').length}`);
    console.log(`   High: ${issues.filter(i => i.severity === 'high').length}`);
    console.log(`   Medium: ${issues.filter(i => i.severity === 'medium').length}`);
    console.log(`   Low: ${issues.filter(i => i.severity === 'low').length}`);
    
    // Get unique pages
    const uniquePages = [...new Set(issues.map(i => i.page_url))];
    console.log(`\n📄 PAGES SCANNED: ${uniquePages.length}`);
    
    // Group issues by page
    const issuesByPage = {};
    issues.forEach(issue => {
      if (!issuesByPage[issue.page_url]) {
        issuesByPage[issue.page_url] = [];
      }
      issuesByPage[issue.page_url].push(issue);
    });
    
    // Display detailed report for each page
    console.log(`\n${'='.repeat(80)}`);
    console.log('🔍 DETAILED ISSUES BY PAGE:');
    console.log('='.repeat(80));
    
    let pageNum = 1;
    for (const [pageUrl, pageIssues] of Object.entries(issuesByPage)) {
      console.log(`\n${pageNum}. PAGE: ${pageUrl}`);
      console.log(`   Issues found: ${pageIssues.length}`);
      console.log(`   ${'-'.repeat(76)}`);
      
      for (let idx = 0; idx < pageIssues.length; idx++) {
        const issue = pageIssues[idx];
        const severityEmoji = {
          'critical': '🔴',
          'high': '🟠',
          'medium': '🟡',
          'low': '🟢'
        }[issue.severity] || '⚪';
        
        console.log(`\n   ${idx + 1}. ${severityEmoji} [${issue.severity.toUpperCase()}] ${issue.title}`);
        console.log(`      Category: ${issue.category}`);
        console.log(`      Description: ${issue.description}`);
        
        if (issue.current_value) {
          console.log(`      Current Value: ${issue.current_value}`);
        }
        
        if (issue.recommended_value) {
          console.log(`      Recommended: ${issue.recommended_value}`);
        }
        
        if (issue.impact) {
          console.log(`      Impact: ${issue.impact}`);
        }
        
        // Check if auto-fix is available
        const fixResult = await pool.query(
          'SELECT * FROM seo_fixes WHERE issue_id = $1',
          [issue.id]
        );
        
        if (fixResult.rows.length > 0) {
          const fix = fixResult.rows[0];
          console.log(`      ✅ AUTO-FIX AVAILABLE:`);
          console.log(`         Type: ${fix.fix_type}`);
          console.log(`         Status: ${fix.status}`);
          if (fix.fix_code) {
            console.log(`         Fix Code: ${fix.fix_code.substring(0, 100)}...`);
          }
        } else {
          console.log(`      ⚠️  AUTO-FIX: Not available yet`);
        }
      }
      
      pageNum++;
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`Total Pages Scanned: ${uniquePages.length}`);
    console.log(`Total Issues Found: ${issues.length}`);
    console.log(`Issues with Auto-Fix: ${await getAutoFixCount(scanId)}`);
    console.log(`\n✅ Report Complete!\n`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  }
}

async function getAutoFixCount(scanId) {
  const result = await pool.query(
    `SELECT COUNT(*) as count 
     FROM seo_fixes f
     JOIN seo_issues i ON f.issue_id = i.id
     WHERE i.scan_id = $1`,
    [scanId]
  );
  return result.rows[0].count;
}

// Get scan ID from command line or use latest
const scanId = process.argv[2] || 145;
getScanReport(scanId);
