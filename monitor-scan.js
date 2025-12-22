// Monitor scan progress in real-time
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function monitorScan(scanId) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 MONITORING SCAN ID: ${scanId}`);
  console.log('='.repeat(80) + '\n');

  let completed = false;
  let attempts = 0;

  while (!completed && attempts < 120) {
    try {
      // Get scan status
      const scan = await pool.query('SELECT * FROM seo_scans WHERE id = $1', [scanId]);
      
      if (scan.rows.length === 0) {
        console.log(`⏳ Waiting for scan ${scanId} to start...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        continue;
      }

      const scanData = scan.rows[0];

      // Get page count
      const pages = await pool.query(
        'SELECT COUNT(DISTINCT page_url) as count FROM seo_issues WHERE scan_id = $1',
        [scanId]
      );
      const pageCount = parseInt(pages.rows[0].count);

      // Get issue count
      const issues = await pool.query(
        'SELECT COUNT(*) as count FROM seo_issues WHERE scan_id = $1',
        [scanId]
      );
      const issueCount = parseInt(issues.rows[0].count);

      // Display progress
      const elapsed = attempts * 2;
      process.stdout.write(`\r[${elapsed}s] Pages: ${pageCount}/10 | Issues: ${issueCount} | Status: ${scanData.status} | Score: ${scanData.seo_score || 0}/100`);

      if (scanData.status === 'completed') {
        completed = true;
        console.log('\n\n✅ Scan completed!\n');

        // Show final results
        console.log('='.repeat(80));
        console.log('📊 FINAL RESULTS');
        console.log('='.repeat(80));
        console.log(`\nScan ID: ${scanId}`);
        console.log(`URL: ${scanData.url}`);
        console.log(`Domain: ${scanData.domain}`);
        console.log(`Status: ${scanData.status}`);
        console.log(`SEO Score: ${scanData.seo_score}/100`);
        console.log(`Pages Scanned: ${pageCount}`);
        console.log(`Total Issues: ${issueCount}`);
        console.log(`Duration: ${elapsed} seconds`);

        // Get issues by severity
        const severityCounts = await pool.query(
          `SELECT severity, COUNT(*) as count 
           FROM seo_issues 
           WHERE scan_id = $1 
           GROUP BY severity`,
          [scanId]
        );

        console.log('\n📋 Issues by Severity:');
        severityCounts.rows.forEach(row => {
          console.log(`   ${row.severity}: ${row.count}`);
        });

        // Get issues on homepage
        const homepageIssues = await pool.query(
          `SELECT * FROM seo_issues 
           WHERE scan_id = $1 AND page_url = $2
           ORDER BY severity DESC`,
          [scanId, scanData.url]
        );

        if (homepageIssues.rows.length > 0) {
          console.log('\n📋 Issues on Homepage:');
          homepageIssues.rows.forEach((issue, i) => {
            console.log(`   ${i + 1}. [${issue.severity}] ${issue.title}`);
          });
        }

        console.log('\n' + '='.repeat(80) + '\n');
        process.exit(0);
      }

      if (scanData.status === 'failed') {
        console.log('\n\n❌ Scan failed!\n');
        console.log(`Error: ${scanData.error_message || 'Unknown error'}\n`);
        process.exit(1);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  }

  if (!completed) {
    console.log('\n\n⏱️ Timeout after ' + (attempts * 2) + ' seconds\n');
    process.exit(1);
  }
}

const scanId = process.argv[2] || 156;
monitorScan(scanId);
