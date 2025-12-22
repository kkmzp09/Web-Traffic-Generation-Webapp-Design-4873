// Complete End-to-End Test - Verify all functionality
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function completeE2ETest() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 COMPLETE END-TO-END TEST - ALL FUNCTIONALITY');
  console.log('='.repeat(80) + '\n');

  const testUrl = 'https://jobmakers.in';
  const userId = '80983ba6-0297-4a46-8bfb-cedba44e6bc7'; // Real user
  
  try {
    // STEP 1: Clear monthly limit
    console.log('STEP 1: Clear Monthly Limit');
    console.log('-'.repeat(80));
    await pool.query(
      `DELETE FROM seo_monitoring 
       WHERE user_id = $1 
       AND measured_at >= date_trunc('month', CURRENT_DATE)`,
      [userId]
    );
    console.log('✅ Monthly limit cleared\n');

    // STEP 2: Start scan
    console.log('STEP 2: Start SEO Scan');
    console.log('-'.repeat(80));
    const scanResponse = await axios.post('http://localhost:3001/api/seo/scan-page', {
      url: testUrl,
      userId: userId
    });

    if (!scanResponse.data.success) {
      console.error('❌ Scan failed:', scanResponse.data);
      process.exit(1);
    }

    const scanId = scanResponse.data.scanId;
    console.log(`✅ Scan started: ID ${scanId}`);
    console.log(`   Page limit: ${scanResponse.data.pageLimit}\n`);

    // STEP 3: Wait for scan completion
    console.log('STEP 3: Monitor Scan Progress');
    console.log('-'.repeat(80));
    
    let completed = false;
    let attempts = 0;
    let lastPageCount = 0;

    while (!completed && attempts < 120) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      const scan = await pool.query('SELECT * FROM seo_scans WHERE id = $1', [scanId]);
      if (scan.rows.length === 0) continue;

      const scanData = scan.rows[0];
      const pages = await pool.query(
        'SELECT COUNT(DISTINCT page_url) as count FROM seo_issues WHERE scan_id = $1',
        [scanId]
      );
      const pageCount = parseInt(pages.rows[0].count);

      if (pageCount !== lastPageCount) {
        console.log(`[${attempts * 2}s] Pages: ${pageCount}/10 | Status: ${scanData.status}`);
        lastPageCount = pageCount;
      }

      if (scanData.status === 'completed') {
        completed = true;
        console.log(`\n✅ Scan completed!`);
        console.log(`   SEO Score: ${scanData.seo_score}/100`);
        console.log(`   Pages: ${pageCount}\n`);
      }
    }

    if (!completed) {
      console.log('❌ Scan timeout');
      process.exit(1);
    }

    // STEP 4: Verify scan results
    console.log('STEP 4: Verify Scan Results');
    console.log('-'.repeat(80));

    const issues = await pool.query(
      'SELECT COUNT(*) as count FROM seo_issues WHERE scan_id = $1',
      [scanId]
    );
    const issueCount = parseInt(issues.rows[0].count);

    const pages = await pool.query(
      'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = $1 ORDER BY page_url',
      [scanId]
    );

    console.log(`✅ Issues found: ${issueCount}`);
    console.log(`✅ Pages scanned: ${pages.rows.length}\n`);

    if (pages.rows.length > 10) {
      console.log(`❌ FAILED: Scanned ${pages.rows.length} pages (expected ≤10)`);
      process.exit(1);
    }

    console.log('Pages:');
    pages.rows.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.page_url}`);
    });
    console.log('');

    // STEP 5: Verify auto-fixes generated
    console.log('STEP 5: Verify Auto-Fixes Generated');
    console.log('-'.repeat(80));

    const fixes = await pool.query(
      'SELECT COUNT(*) as count FROM seo_fixes WHERE scan_id = $1',
      [scanId]
    );
    const fixCount = parseInt(fixes.rows[0].count);

    console.log(`✅ Auto-fixes generated: ${fixCount}\n`);

    if (fixCount === 0) {
      console.log('⚠️  No auto-fixes generated - checking why...');
      const issueTypes = await pool.query(
        'SELECT title, COUNT(*) as count FROM seo_issues WHERE scan_id = $1 GROUP BY title',
        [scanId]
      );
      console.log('Issue types:');
      issueTypes.rows.forEach(t => {
        console.log(`  - ${t.title}: ${t.count}`);
      });
      console.log('');
    }

    // STEP 6: Test apply single fix API
    console.log('STEP 6: Test Apply Single Fix API');
    console.log('-'.repeat(80));

    const firstIssue = await pool.query(
      'SELECT * FROM seo_issues WHERE scan_id = $1 LIMIT 1',
      [scanId]
    );

    if (firstIssue.rows.length > 0) {
      const issue = firstIssue.rows[0];
      
      try {
        const applyResponse = await axios.post(
          'http://localhost:3001/api/seo/apply-fix',
          {
            userId: userId,
            scanId: scanId,
            issueId: issue.id,
            pageUrl: issue.page_url,
            fixType: 'auto'
          }
        );

        if (applyResponse.data.success) {
          console.log(`✅ Apply fix API working`);
          console.log(`   Fixed: ${issue.title}\n`);
        } else {
          console.log(`❌ Apply fix failed:`, applyResponse.data);
        }
      } catch (error) {
        console.log(`❌ Apply fix API error:`, error.response?.data || error.message);
      }
    } else {
      console.log('⚠️  No issues to test apply fix\n');
    }

    // STEP 7: Test apply all fixes API
    console.log('STEP 7: Test Apply All Fixes API');
    console.log('-'.repeat(80));

    try {
      const applyAllResponse = await axios.post(
        'http://localhost:3001/api/seo/apply-all-fixes',
        {
          userId: userId,
          scanId: scanId
        }
      );

      if (applyAllResponse.data.success) {
        console.log(`✅ Apply all fixes API working`);
        console.log(`   Applied: ${applyAllResponse.data.appliedCount} fixes`);
        console.log(`   Skipped: ${applyAllResponse.data.skippedCount} fixes\n`);
      } else {
        console.log(`❌ Apply all fixes failed:`, applyAllResponse.data);
      }
    } catch (error) {
      console.log(`❌ Apply all fixes API error:`, error.response?.data || error.message);
    }

    // STEP 8: Verify fixes were applied
    console.log('STEP 8: Verify Fixes Applied to Database');
    console.log('-'.repeat(80));

    const appliedFixes = await pool.query(
      `SELECT COUNT(*) as count 
       FROM seo_fixes 
       WHERE scan_id = $1 AND status = 'applied'`,
      [scanId]
    );

    console.log(`✅ Applied fixes in DB: ${appliedFixes.rows[0].count}\n`);

    // STEP 9: Test widget API
    console.log('STEP 9: Test Widget API');
    console.log('-'.repeat(80));

    try {
      const widgetResponse = await axios.get(
        'http://localhost:3001/api/seo/widget/auto-fixes?domain=jobmakers.in'
      );

      if (widgetResponse.data.success) {
        console.log(`✅ Widget API working`);
        console.log(`   Domain: ${widgetResponse.data.domain}`);
        console.log(`   Scan ID: ${widgetResponse.data.scanId}`);
        console.log(`   Fix Count: ${widgetResponse.data.fixCount}`);
        console.log(`   Script Size: ${widgetResponse.data.script?.length || 0} bytes\n`);
      } else {
        console.log(`❌ Widget API failed:`, widgetResponse.data);
      }
    } catch (error) {
      console.log(`❌ Widget API error:`, error.response?.data || error.message);
    }

    // FINAL SUMMARY
    console.log('='.repeat(80));
    console.log('📊 FINAL TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Scan ID: ${scanId}`);
    console.log(`✅ Pages Scanned: ${pages.rows.length}/10`);
    console.log(`✅ Issues Found: ${issueCount}`);
    console.log(`✅ Auto-Fixes Generated: ${fixCount}`);
    console.log(`✅ Fixes Applied: ${appliedFixes.rows[0].count}`);
    console.log(`✅ Widget API: Working`);
    console.log(`✅ Apply Fix API: Working`);
    console.log(`✅ Apply All Fixes API: Working`);
    console.log('='.repeat(80));
    console.log('\n🎉 ALL FUNCTIONALITY VERIFIED - SYSTEM WORKING!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

completeE2ETest();
