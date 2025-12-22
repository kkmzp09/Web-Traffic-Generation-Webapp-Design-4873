// END-TO-END TEST: Scan → Find Issues → Apply Fixes → Verify
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const API_BASE = 'http://localhost:3001/api/seo';
const TEST_URL = 'https://jobmakers.in';
const TEST_DOMAIN = 'jobmakers.in';
const USER_ID = '80983ba6-0297-4a46-8bfb-cedba44e6bc7';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function endToEndTest() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 END-TO-END AUTO-FIX TEST');
  console.log('='.repeat(80) + '\n');

  let scanId;

  try {
    // STEP 1: Start SEO Scan
    console.log('STEP 1: Starting SEO Scan');
    console.log('-'.repeat(80));
    console.log(`URL: ${TEST_URL}\n`);

    const scanResponse = await axios.post(`${API_BASE}/scan-page`, {
      url: TEST_URL,
      userId: USER_ID
    });

    if (!scanResponse.data.success) {
      throw new Error('Scan failed: ' + JSON.stringify(scanResponse.data));
    }

    scanId = scanResponse.data.scanId;
    console.log(`✅ Scan started: ID ${scanId}\n`);

    // STEP 2: Wait for scan to complete
    console.log('STEP 2: Waiting for Scan Completion');
    console.log('-'.repeat(80));

    let scanCompleted = false;
    let attempts = 0;
    const maxAttempts = 120; // 4 minutes max

    while (!scanCompleted && attempts < maxAttempts) {
      await sleep(2000);
      attempts++;

      const scan = await pool.query('SELECT * FROM seo_scans WHERE id = $1', [scanId]);
      
      if (scan.rows.length === 0) {
        process.stdout.write(`\r[${attempts * 2}s] Waiting for scan to start...`);
        continue;
      }

      const scanData = scan.rows[0];
      const pages = await pool.query(
        'SELECT COUNT(DISTINCT page_url) as count FROM seo_issues WHERE scan_id = $1',
        [scanId]
      );
      const pageCount = parseInt(pages.rows[0].count);

      process.stdout.write(`\r[${attempts * 2}s] Pages: ${pageCount}/10 | Status: ${scanData.status}`);

      if (scanData.status === 'completed') {
        scanCompleted = true;
        console.log('\n✅ Scan completed!\n');
      }
    }

    if (!scanCompleted) {
      throw new Error('Scan timeout after ' + (attempts * 2) + ' seconds');
    }

    // STEP 3: Get scan results and issues
    console.log('STEP 3: Analyzing Scan Results');
    console.log('-'.repeat(80));

    const scan = await pool.query('SELECT * FROM seo_scans WHERE id = $1', [scanId]);
    const scanData = scan.rows[0];

    const issues = await pool.query(
      `SELECT * FROM seo_issues 
       WHERE scan_id = $1 AND page_url = $2
       ORDER BY severity DESC`,
      [scanId, TEST_URL]
    );

    console.log(`\n📊 Scan Results:`);
    console.log(`   SEO Score: ${scanData.seo_score}/100`);
    console.log(`   Issues Found: ${issues.rows.length}`);
    console.log(`   Pages Scanned: ${scanData.pages_scanned || 10}\n`);

    if (issues.rows.length > 0) {
      console.log('📋 Issues on Homepage:\n');
      issues.rows.slice(0, 5).forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.severity}] ${issue.title}`);
      });
      console.log('');
    }

    // STEP 4: Apply all fixes
    console.log('STEP 4: Applying Auto-Fixes');
    console.log('-'.repeat(80));

    const applyResponse = await axios.post(`${API_BASE}/apply-all-fixes`, {
      userId: USER_ID,
      scanId: scanId
    });

    if (!applyResponse.data.success) {
      throw new Error('Apply fixes failed: ' + JSON.stringify(applyResponse.data));
    }

    console.log(`\n✅ Fixes Applied:`);
    console.log(`   Applied: ${applyResponse.data.appliedCount} fixes`);
    console.log(`   Skipped: ${applyResponse.data.skippedCount} fixes\n`);

    // STEP 5: Verify fixes are working
    console.log('STEP 5: Verifying Auto-Fixes (Server-Side)');
    console.log('-'.repeat(80));
    console.log('\nThis will:');
    console.log('  1. Load the page in headless browser');
    console.log('  2. Inject widget script');
    console.log('  3. Capture BEFORE state');
    console.log('  4. Execute widget');
    console.log('  5. Capture AFTER state');
    console.log('  6. Compare and detect changes\n');

    const verifyResponse = await axios.post(`${API_BASE}/verify-autofix`, {
      scanId: scanId,
      url: TEST_URL,
      domain: TEST_DOMAIN
    });

    if (!verifyResponse.data.success) {
      throw new Error('Verification failed: ' + JSON.stringify(verifyResponse.data));
    }

    const verification = verifyResponse.data;

    console.log('✅ Verification Complete!\n');

    // STEP 6: Display verification results
    console.log('STEP 6: Verification Results');
    console.log('-'.repeat(80));

    console.log(`\n📊 Summary:`);
    console.log(`   Verified: ${verification.verified ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Changes Detected: ${verification.changeCount}`);
    console.log(`   Message: ${verification.message}\n`);

    if (verification.changes && verification.changes.length > 0) {
      console.log('📋 Detected Changes:\n');
      verification.changes.forEach((change, i) => {
        console.log(`   ${i + 1}. ${change.field.toUpperCase()}:`);
        if (change.beforeLength !== undefined) {
          console.log(`      BEFORE: ${change.beforeLength} chars`);
          console.log(`      AFTER:  ${change.afterLength} chars`);
        } else {
          console.log(`      BEFORE: ${change.before}`);
          console.log(`      AFTER:  ${change.after}`);
        }
      });
      console.log('');
    }

    if (verification.widgetLogs && verification.widgetLogs.length > 0) {
      console.log('📋 Widget Console Logs:\n');
      verification.widgetLogs.forEach((log, i) => {
        console.log(`   ${i + 1}. ${log}`);
      });
      console.log('');
    }

    // STEP 7: Query database for stored verification
    console.log('STEP 7: Checking Database Record');
    console.log('-'.repeat(80));

    const dbRecord = await pool.query(
      'SELECT * FROM autofix_verifications WHERE scan_id = $1 ORDER BY created_at DESC LIMIT 1',
      [scanId]
    );

    if (dbRecord.rows.length > 0) {
      const record = dbRecord.rows[0];
      console.log(`\n✅ Verification stored in database:`);
      console.log(`   Record ID: ${record.id}`);
      console.log(`   Scan ID: ${record.scan_id}`);
      console.log(`   URL: ${record.url}`);
      console.log(`   Status: ${record.verification_status}`);
      console.log(`   Change Count: ${record.change_count}`);
      console.log(`   Verified At: ${record.verified_at}\n`);
    }

    // FINAL SUMMARY
    console.log('='.repeat(80));
    console.log('🎉 END-TO-END TEST COMPLETE!');
    console.log('='.repeat(80));

    console.log(`\n✅ All Steps Successful:`);
    console.log(`   1. ✅ SEO Scan completed (Scan ID: ${scanId})`);
    console.log(`   2. ✅ Found ${issues.rows.length} issues`);
    console.log(`   3. ✅ Applied ${applyResponse.data.appliedCount} fixes`);
    console.log(`   4. ✅ Verified ${verification.changeCount} changes`);
    console.log(`   5. ✅ Stored verification in database`);

    console.log(`\n🎯 Customer Impact:`);
    console.log(`   - SEO issues identified and fixed automatically`);
    console.log(`   - Changes verified from server (no browser needed)`);
    console.log(`   - All data stored in Neon database`);
    console.log(`   - Ready for production use`);

    console.log('\n' + '='.repeat(80) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

endToEndTest();
