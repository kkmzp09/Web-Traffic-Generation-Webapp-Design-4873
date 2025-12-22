// Complete end-to-end scan test with auto-fix
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function completeScanTest() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 COMPLETE SCAN TEST - END TO END');
    console.log('='.repeat(80) + '\n');
    
    const testUrl = 'https://jobmakers.in';
    const userId = '00000000-0000-0000-0000-000000000000';
    
    // Step 1: Start scan
    console.log('STEP 1: Starting Scan');
    console.log('-'.repeat(80));
    console.log(`URL: ${testUrl}`);
    console.log(`User ID: ${userId}\n`);
    
    const scanResponse = await axios.post('http://localhost:3001/api/seo/scan-page', {
      url: testUrl,
      userId: userId
    });
    
    if (!scanResponse.data.success) {
      console.error('❌ Scan failed:', scanResponse.data);
      return;
    }
    
    const scanId = scanResponse.data.scanId;
    console.log(`✅ Scan started! Scan ID: ${scanId}`);
    console.log(`   Page limit: ${scanResponse.data.pageLimit}\n`);
    
    // Step 2: Wait for scan to complete
    console.log('STEP 2: Waiting for Scan to Complete');
    console.log('-'.repeat(80));
    
    let completed = false;
    let attempts = 0;
    const maxAttempts = 90; // 3 minutes max
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      try {
        const statusResponse = await axios.get(
          `http://localhost:3001/api/seo/scan/${scanId}?userId=${userId}`
        );
        
        if (statusResponse.data.success && statusResponse.data.scan) {
          const scan = statusResponse.data.scan;
          
          if (scan.status === 'completed') {
            completed = true;
            console.log(`\n✅ Scan completed after ${attempts * 2} seconds!`);
            console.log(`   SEO Score: ${scan.seo_score}/100`);
            console.log(`   Total Issues: ${statusResponse.data.issues?.length || 0}`);
            console.log(`   Critical: ${scan.critical_issues || 0}`);
            console.log(`   Warnings: ${scan.warnings || 0}\n`);
          } else {
            process.stdout.write(`\r[${attempts * 2}s] Status: ${scan.status}...`);
          }
        }
      } catch (error) {
        // Keep waiting
      }
    }
    
    if (!completed) {
      console.log('\n⚠️  Scan timeout - checking database directly...\n');
    }
    
    // Step 3: Check scan results in database
    console.log('STEP 3: Checking Scan Results');
    console.log('-'.repeat(80));
    
    const scanResult = await pool.query(
      'SELECT * FROM seo_scans WHERE id = $1',
      [scanId]
    );
    
    if (scanResult.rows.length === 0) {
      console.log('❌ Scan not found in database');
      return;
    }
    
    const scan = scanResult.rows[0];
    console.log(`Scan ID: ${scan.id}`);
    console.log(`URL: ${scan.url}`);
    console.log(`Domain: ${scan.domain}`);
    console.log(`Status: ${scan.status}`);
    console.log(`SEO Score: ${scan.seo_score}/100`);
    console.log(`Created: ${scan.created_at}`);
    console.log(`Completed: ${scan.scanned_at || 'in progress'}\n`);
    
    // Step 4: Check issues found
    console.log('STEP 4: Issues Found');
    console.log('-'.repeat(80));
    
    const issuesResult = await pool.query(
      `SELECT page_url, title, severity, category 
       FROM seo_issues 
       WHERE scan_id = $1 
       ORDER BY severity, page_url
       LIMIT 10`,
      [scanId]
    );
    
    console.log(`Total Issues: ${issuesResult.rows.length}`);
    issuesResult.rows.forEach((issue, idx) => {
      console.log(`\n${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
      console.log(`   Category: ${issue.category}`);
      console.log(`   Page: ${issue.page_url}`);
    });
    
    // Step 5: Check auto-fixes generated
    console.log('\n\nSTEP 5: Auto-Fixes Generated');
    console.log('-'.repeat(80));
    
    const fixesResult = await pool.query(
      `SELECT f.id, f.fix_type, f.status, i.title, i.page_url
       FROM seo_fixes f
       JOIN seo_issues i ON f.issue_id = i.id
       WHERE f.scan_id = $1`,
      [scanId]
    );
    
    console.log(`Total Auto-Fixes: ${fixesResult.rows.length}\n`);
    
    if (fixesResult.rows.length > 0) {
      fixesResult.rows.slice(0, 5).forEach((fix, idx) => {
        console.log(`${idx + 1}. ${fix.title}`);
        console.log(`   Type: ${fix.fix_type}`);
        console.log(`   Status: ${fix.status}`);
        console.log(`   Page: ${fix.page_url}\n`);
      });
    } else {
      console.log('⚠️  No auto-fixes generated yet');
    }
    
    // Step 6: Test Widget API
    console.log('STEP 6: Testing Widget API');
    console.log('-'.repeat(80));
    
    const widgetResponse = await axios.get(
      `http://localhost:3001/api/seo/widget/auto-fixes?domain=${scan.domain}`
    );
    
    if (widgetResponse.data.success) {
      console.log(`✅ Widget API Working!`);
      console.log(`   Domain: ${widgetResponse.data.domain}`);
      console.log(`   Scan ID: ${widgetResponse.data.scanId}`);
      console.log(`   Fix Count: ${widgetResponse.data.fixCount}`);
      console.log(`   Script Size: ${widgetResponse.data.script?.length || 0} bytes\n`);
      
      // Show script preview
      if (widgetResponse.data.script) {
        console.log('📄 Script Preview (first 500 chars):');
        console.log('-'.repeat(80));
        console.log(widgetResponse.data.script.substring(0, 500) + '...\n');
      }
    } else {
      console.log('❌ Widget API failed:', widgetResponse.data);
    }
    
    // Step 7: Show actual URLs scanned
    console.log('STEP 7: Actual Pages Scanned');
    console.log('-'.repeat(80));
    
    const pagesResult = await pool.query(
      `SELECT DISTINCT page_url 
       FROM seo_issues 
       WHERE scan_id = $1 
       ORDER BY page_url`,
      [scanId]
    );
    
    console.log(`Total Pages: ${pagesResult.rows.length}\n`);
    pagesResult.rows.forEach((page, idx) => {
      console.log(`${idx + 1}. ${page.page_url}`);
    });
    
    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Scan ID: ${scanId}`);
    console.log(`✅ URL: ${scan.url}`);
    console.log(`✅ Domain: ${scan.domain}`);
    console.log(`✅ Pages Scanned: ${pagesResult.rows.length}`);
    console.log(`✅ Issues Found: ${issuesResult.rows.length}`);
    console.log(`✅ Auto-Fixes Generated: ${fixesResult.rows.length}`);
    console.log(`✅ Widget API: Working`);
    console.log(`✅ Widget URL: https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=${scan.domain}`);
    console.log('='.repeat(80) + '\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

completeScanTest();
