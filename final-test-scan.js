// Final test - Run scan and verify 10-page limit
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function finalTest() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 FINAL TEST - 10-PAGE LIMIT VERIFICATION');
    console.log('='.repeat(80) + '\n');
    
    const testUrl = 'https://jobmakers.in';
    const userId = '00000000-0000-0000-0000-000000000000';
    
    // Start scan
    console.log('STEP 1: Starting Scan');
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
    console.log(`✅ Scan ${scanId} started`);
    console.log(`   Page limit: ${scanResponse.data.pageLimit}\n`);
    
    // Monitor in real-time
    console.log('STEP 2: Monitoring Scan Progress');
    console.log('-'.repeat(80));
    
    let lastPageCount = 0;
    let checkCount = 0;
    let scanCompleted = false;
    
    while (!scanCompleted && checkCount < 120) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      checkCount++;
      
      // Get scan status
      const scan = await pool.query('SELECT * FROM seo_scans WHERE id = $1', [scanId]);
      
      if (scan.rows.length === 0) continue;
      
      const scanData = scan.rows[0];
      
      // Count pages
      const pages = await pool.query(
        'SELECT COUNT(DISTINCT page_url) as count FROM seo_issues WHERE scan_id = $1',
        [scanId]
      );
      const pageCount = parseInt(pages.rows[0].count);
      
      // Display progress
      if (pageCount !== lastPageCount) {
        console.log(`[${checkCount * 2}s] Pages: ${pageCount} | Status: ${scanData.status}`);
        lastPageCount = pageCount;
      }
      
      // Check if exceeded
      if (pageCount > 10 && scanData.status === 'scanning') {
        console.log('\n🚨 ALERT: Exceeded 10 pages!');
        console.log(`   Stopping scan at ${pageCount} pages...\n`);
        
        await pool.query(
          'UPDATE seo_scans SET status = $1, scanned_at = NOW() WHERE id = $2',
          ['failed', scanId]
        );
        
        scanCompleted = true;
        break;
      }
      
      // Check if completed
      if (scanData.status === 'completed') {
        scanCompleted = true;
      }
    }
    
    // Final verification
    console.log('\n' + '='.repeat(80));
    console.log('STEP 3: Final Verification');
    console.log('='.repeat(80) + '\n');
    
    const finalScan = await pool.query('SELECT * FROM seo_scans WHERE id = $1', [scanId]);
    const finalPages = await pool.query(
      'SELECT DISTINCT page_url FROM seo_issues WHERE scan_id = $1 ORDER BY page_url',
      [scanId]
    );
    const finalIssues = await pool.query(
      'SELECT COUNT(*) as count FROM seo_issues WHERE scan_id = $1',
      [scanId]
    );
    const finalFixes = await pool.query(
      'SELECT COUNT(*) as count FROM seo_fixes WHERE scan_id = $1',
      [scanId]
    );
    
    const pageCount = finalPages.rows.length;
    
    console.log(`Scan ID: ${scanId}`);
    console.log(`Status: ${finalScan.rows[0].status}`);
    console.log(`Pages Scanned: ${pageCount}`);
    console.log(`Issues Found: ${finalIssues.rows[0].count}`);
    console.log(`Auto-Fixes: ${finalFixes.rows[0].count}\n`);
    
    console.log('Pages:');
    finalPages.rows.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.page_url}`);
    });
    
    // VERDICT
    console.log('\n' + '='.repeat(80));
    if (pageCount <= 10) {
      console.log('✅ TEST PASSED: 10-PAGE LIMIT WORKING!');
      console.log('='.repeat(80));
      console.log(`   Expected: ≤10 pages`);
      console.log(`   Actual: ${pageCount} pages`);
      console.log(`   Status: ✅ PASS\n`);
      
      console.log('🎉 SYSTEM READY FOR FRONTEND TESTING!\n');
      process.exit(0);
    } else {
      console.log('❌ TEST FAILED: EXCEEDED 10 PAGES!');
      console.log('='.repeat(80));
      console.log(`   Expected: ≤10 pages`);
      console.log(`   Actual: ${pageCount} pages`);
      console.log(`   Excess: ${pageCount - 10} pages`);
      console.log(`   Status: ❌ FAIL\n`);
      
      console.log('⚠️  DO NOT TEST FROM FRONTEND YET!\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

finalTest();
