// Test Auto-Fix: Capture Before/After with 5-page scan
const axios = require('axios');
const { Pool } = require('pg');
const cheerio = require('cheerio');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function capturePageMeta(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)' }
    });
    
    const $ = cheerio.load(response.data);
    
    return {
      url,
      title: $('title').text() || 'No title',
      titleLength: ($('title').text() || '').length,
      metaDescription: $('meta[name="description"]').attr('content') || 'No meta description',
      metaDescLength: ($('meta[name="description"]').attr('content') || '').length,
      h1: $('h1').first().text() || 'No H1',
      canonical: $('link[rel="canonical"]').attr('href') || 'No canonical',
      ogTitle: $('meta[property="og:title"]').attr('content') || 'No OG title',
      ogDescription: $('meta[property="og:description"]').attr('content') || 'No OG description',
      hasSchema: $('script[type="application/ld+json"]').length > 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testAutoFixBeforeAfter() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 AUTO-FIX BEFORE/AFTER TEST - 5 PAGES');
  console.log('='.repeat(80) + '\n');

  const testUrl = 'https://jobmakers.in';
  const userId = '80983ba6-0297-4a46-8bfb-cedba44e6bc7';
  
  try {
    // STEP 1: Capture BEFORE state
    console.log('STEP 1: Capturing BEFORE State');
    console.log('-'.repeat(80));
    
    const beforeState = await capturePageMeta(testUrl);
    console.log('\n📸 BEFORE Auto-Fix:');
    console.log(JSON.stringify(beforeState, null, 2));
    console.log('');

    // STEP 2: Start scan (will scan up to 10 pages, but we'll monitor first 5)
    console.log('STEP 2: Starting SEO Scan');
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
    console.log(`✅ Scan started: ID ${scanId}\n`);

    // STEP 3: Wait for scan to complete
    console.log('STEP 3: Waiting for Scan Completion');
    console.log('-'.repeat(80));
    
    let completed = false;
    let attempts = 0;

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

      process.stdout.write(`\r[${attempts * 2}s] Pages: ${pageCount}/10 | Status: ${scanData.status}`);

      if (scanData.status === 'completed') {
        completed = true;
        console.log('\n✅ Scan completed!\n');
      }
    }

    if (!completed) {
      console.log('\n❌ Scan timeout');
      process.exit(1);
    }

    // STEP 4: Get scan results
    console.log('STEP 4: Analyzing Scan Results');
    console.log('-'.repeat(80));

    const issues = await pool.query(
      `SELECT * FROM seo_issues 
       WHERE scan_id = $1 AND page_url = $2
       ORDER BY severity DESC`,
      [scanId, testUrl]
    );

    console.log(`\n📋 Issues found on homepage: ${issues.rows.length}`);
    issues.rows.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.severity}] ${issue.title}`);
      if (issue.current_value) {
        console.log(`     Current: ${issue.current_value.substring(0, 60)}...`);
      }
    });
    console.log('');

    // STEP 5: Apply all fixes
    console.log('STEP 5: Applying All Auto-Fixes');
    console.log('-'.repeat(80));

    const applyResponse = await axios.post(
      'http://localhost:3001/api/seo/apply-all-fixes',
      {
        userId: userId,
        scanId: scanId
      }
    );

    if (applyResponse.data.success) {
      console.log(`✅ Applied: ${applyResponse.data.appliedCount} fixes`);
      console.log(`⏭️  Skipped: ${applyResponse.data.skippedCount} fixes\n`);
    }

    // STEP 6: Get generated fix code
    console.log('STEP 6: Retrieving Generated Fix Code');
    console.log('-'.repeat(80));

    const fixes = await pool.query(
      `SELECT * FROM seo_fixes 
       WHERE scan_id = $1 AND status = 'applied'
       ORDER BY created_at`,
      [scanId]
    );

    console.log(`\n📝 Generated ${fixes.rows.length} fix scripts:\n`);
    
    fixes.rows.slice(0, 3).forEach((fix, i) => {
      console.log(`Fix ${i + 1}:`);
      console.log(fix.fix_code.substring(0, 200) + '...\n');
    });

    // STEP 7: Test widget API
    console.log('STEP 7: Testing Widget API');
    console.log('-'.repeat(80));

    const widgetResponse = await axios.get(
      `http://localhost:3001/api/seo/widget/auto-fixes?domain=jobmakers.in`
    );

    console.log(`\n✅ Widget API Response:`);
    console.log(`   Domain: ${widgetResponse.data.domain}`);
    console.log(`   Scan ID: ${widgetResponse.data.scanId}`);
    console.log(`   Fix Count: ${widgetResponse.data.fixCount}`);
    console.log(`   Script Size: ${widgetResponse.data.script?.length || 0} bytes\n`);

    if (widgetResponse.data.script) {
      console.log('📜 Widget Script Preview:');
      console.log(widgetResponse.data.script.substring(0, 500) + '...\n');
    }

    // STEP 8: Simulate widget execution (what WOULD happen on the page)
    console.log('STEP 8: Simulating Widget Execution');
    console.log('-'.repeat(80));

    console.log('\n🔮 SIMULATED AFTER State (if widget was installed):');
    console.log('');
    
    // Show what each fix would do
    const titleFix = issues.rows.find(i => i.title.includes('Title'));
    const metaFix = issues.rows.find(i => i.title.includes('Meta Description'));
    
    if (titleFix) {
      console.log('📝 Title:');
      console.log(`   BEFORE: ${beforeState.title} (${beforeState.titleLength} chars)`);
      if (titleFix.title === 'Title Too Long') {
        console.log(`   AFTER:  ${beforeState.title.substring(0, 57)}... (60 chars)`);
      } else if (titleFix.title === 'Title Too Short') {
        console.log(`   AFTER:  ${beforeState.title} | Professional Services (50+ chars)`);
      }
      console.log('');
    }

    if (metaFix) {
      console.log('📝 Meta Description:');
      console.log(`   BEFORE: ${beforeState.metaDescription.substring(0, 60)}... (${beforeState.metaDescLength} chars)`);
      if (metaFix.title === 'Meta Description Too Short') {
        console.log(`   AFTER:  ${beforeState.metaDescription} Learn more about our comprehensive services... (120+ chars)`);
      } else if (metaFix.title === 'Meta Description Too Long') {
        console.log(`   AFTER:  ${beforeState.metaDescription.substring(0, 157)}... (160 chars)`);
      }
      console.log('');
    }

    // STEP 9: Show fix installation instructions
    console.log('STEP 9: Installation Instructions');
    console.log('-'.repeat(80));
    console.log('\n📦 To see these fixes LIVE on your website:\n');
    console.log('1. Add this code to jobmakers.in:');
    console.log('');
    console.log('   <script src="https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=jobmakers.in"></script>');
    console.log('');
    console.log('2. Place it in the <head> section or before </body>');
    console.log('3. The fixes will apply automatically when users visit your site');
    console.log('4. View page source will still show OLD values (fixes are client-side)');
    console.log('5. But browser inspector will show NEW values (after JavaScript runs)');
    console.log('');

    // FINAL SUMMARY
    console.log('='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Scan ID: ${scanId}`);
    console.log(`✅ Issues Found: ${issues.rows.length}`);
    console.log(`✅ Fixes Applied: ${applyResponse.data.appliedCount}`);
    console.log(`✅ Widget Script: ${widgetResponse.data.script?.length || 0} bytes`);
    console.log('');
    console.log('⚠️  IMPORTANT: Fixes are CLIENT-SIDE JavaScript');
    console.log('   - View Source: Shows ORIGINAL HTML');
    console.log('   - Browser Inspector: Shows MODIFIED HTML (after JS runs)');
    console.log('   - Widget must be installed for fixes to work');
    console.log('='.repeat(80) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testAutoFixBeforeAfter();
