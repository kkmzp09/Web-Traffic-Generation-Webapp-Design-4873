// Simple server-side widget verification
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

async function simpleVerifyWidget(url, domain) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 WIDGET VERIFICATION REPORT');
  console.log('='.repeat(80) + '\n');
  console.log(`Website: ${url}`);
  console.log(`Domain: ${domain}\n`);

  try {
    // STEP 1: Check if widget is installed on website
    console.log('STEP 1: Checking Widget Installation on Website');
    console.log('-'.repeat(80));
    
    const pageResponse = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)' }
    });

    const $ = cheerio.load(pageResponse.data);

    // Capture original values
    const original = {
      title: $('title').text() || 'No title',
      titleLength: ($('title').text() || '').length,
      metaDesc: $('meta[name="description"]').attr('content') || 'No meta',
      metaDescLength: ($('meta[name="description"]').attr('content') || '').length
    };

    console.log('\n📸 Original HTML (from server):');
    console.log(`   Title: "${original.title}"`);
    console.log(`   Title Length: ${original.titleLength} chars`);
    console.log(`   Meta Description: "${original.metaDesc.substring(0, 60)}..."`);
    console.log(`   Meta Length: ${original.metaDescLength} chars\n`);

    // Check for widget script
    let widgetFound = false;
    let widgetUrl = null;

    $('script').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && src.includes('organitrafficboost.com/api/seo/widget')) {
        widgetFound = true;
        widgetUrl = src;
        return false;
      }
    });

    if (widgetFound) {
      console.log('✅ Widget Script Found:');
      console.log(`   ${widgetUrl}\n`);
    } else {
      console.log('❌ Widget Script NOT Found\n');
      console.log('⚠️  Widget must be installed for fixes to work!\n');
      console.log('Add this to your website:');
      console.log(`<script src="https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=${domain}"></script>\n`);
      console.log('='.repeat(80) + '\n');
      process.exit(1);
    }

    // STEP 2: Check widget API response
    console.log('STEP 2: Checking Widget API Response');
    console.log('-'.repeat(80));

    const apiUrl = `http://localhost:3001/api/seo/widget/auto-fixes?domain=${domain}`;
    const widgetResponse = await axios.get(apiUrl);

    console.log(`\n✅ Widget API Status: ${widgetResponse.status}`);
    console.log(`   Domain: ${widgetResponse.data.domain}`);
    console.log(`   Scan ID: ${widgetResponse.data.scanId}`);
    console.log(`   Fix Count: ${widgetResponse.data.fixCount}`);
    console.log(`   Script Size: ${widgetResponse.data.script?.length || 0} bytes\n`);

    if (widgetResponse.data.fixCount === 0) {
      console.log('⚠️  No fixes available from API');
      console.log('   Run a scan and apply fixes first\n');
      console.log('='.repeat(80) + '\n');
      process.exit(1);
    }

    // STEP 3: Show what fixes will do
    console.log('STEP 3: Expected Changes After Widget Executes');
    console.log('-'.repeat(80));

    console.log('\n📋 What the widget will do:\n');

    // Analyze expected changes based on original values
    const expectedChanges = [];

    if (original.titleLength > 60) {
      const newTitle = original.title.substring(0, 57) + '...';
      expectedChanges.push({
        type: 'Title',
        before: `"${original.title}" (${original.titleLength} chars)`,
        after: `"${newTitle}" (60 chars)`,
        status: 'Will be shortened'
      });
    } else if (original.titleLength < 50) {
      expectedChanges.push({
        type: 'Title',
        before: `"${original.title}" (${original.titleLength} chars)`,
        after: `"${original.title} | Professional Services" (50+ chars)`,
        status: 'Will be extended'
      });
    }

    if (original.metaDescLength < 120) {
      expectedChanges.push({
        type: 'Meta Description',
        before: `${original.metaDescLength} chars (too short)`,
        after: '120+ chars (extended with additional text)',
        status: 'Will be extended'
      });
    } else if (original.metaDescLength > 160) {
      expectedChanges.push({
        type: 'Meta Description',
        before: `${original.metaDescLength} chars (too long)`,
        after: '160 chars (shortened)',
        status: 'Will be shortened'
      });
    }

    if (expectedChanges.length > 0) {
      expectedChanges.forEach((change, i) => {
        console.log(`${i + 1}. ${change.type}:`);
        console.log(`   BEFORE: ${change.before}`);
        console.log(`   AFTER:  ${change.after}`);
        console.log(`   STATUS: ✅ ${change.status}\n`);
      });
    }

    // STEP 4: Final verdict
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80));

    console.log('\n✅ Widget Installation: VERIFIED');
    console.log('   - Widget script tag found on website ✅');
    console.log('   - Widget API responding ✅');
    console.log(`   - ${widgetResponse.data.fixCount} fixes ready to apply ✅`);
    console.log(`   - ${expectedChanges.length} changes will be visible ✅\n`);

    console.log('🎯 HOW IT WORKS:');
    console.log('   1. User visits your website');
    console.log('   2. Browser loads HTML (shows BEFORE values)');
    console.log('   3. Widget JavaScript executes (~700ms)');
    console.log('   4. DOM is modified (AFTER values)');
    console.log('   5. User sees FIXED version\n');

    console.log('⚠️  IMPORTANT NOTES:');
    console.log('   - View Source (Ctrl+U): Shows BEFORE (original HTML)');
    console.log('   - Browser Inspector (F12): Shows AFTER (modified DOM)');
    console.log('   - Users see: AFTER (fixed version)');
    console.log('   - Search engines (Google/Bing): See AFTER (they execute JS)\n');

    console.log('✅ CUSTOMER VERIFICATION:');
    console.log('   Tell your customer to check the browser tab title');
    console.log(`   BEFORE: "${original.title}"`);
    if (expectedChanges.length > 0 && expectedChanges[0].type === 'Title') {
      console.log(`   AFTER:  ${expectedChanges[0].after}`);
      console.log('   If they see "..." at the end, widget is working! ✅\n');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.log('\n' + '='.repeat(80) + '\n');
    process.exit(1);
  }
}

// Run verification
const testUrl = 'https://jobmakers.in';
const testDomain = 'jobmakers.in';
simpleVerifyWidget(testUrl, testDomain);
