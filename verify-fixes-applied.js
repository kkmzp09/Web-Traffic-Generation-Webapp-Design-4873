// Server-side verification: Check if fixes are actually applied
const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');
require('dotenv').config();

async function verifyFixesApplied(url) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VERIFYING SEO FIXES ARE APPLIED');
  console.log('='.repeat(80) + '\n');
  console.log(`Testing URL: ${url}\n`);

  try {
    // STEP 1: Fetch original HTML
    console.log('STEP 1: Fetching Original HTML');
    console.log('-'.repeat(80));
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)' }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Capture BEFORE state
    const before = {
      title: $('title').text() || 'No title',
      titleLength: ($('title').text() || '').length,
      metaDescription: $('meta[name="description"]').attr('content') || 'No meta',
      metaDescLength: ($('meta[name="description"]').attr('content') || '').length,
      hasH1: $('h1').length > 0,
      hasCanonical: $('link[rel="canonical"]').length > 0,
      hasOG: $('meta[property^="og:"]').length > 0,
      hasSchema: $('script[type="application/ld+json"]').length > 0
    };

    console.log('\n📸 BEFORE (Original HTML from Server):\n');
    console.log(`Title: "${before.title}"`);
    console.log(`Title Length: ${before.titleLength} chars`);
    console.log(`Meta Description: "${before.metaDescription.substring(0, 60)}..."`);
    console.log(`Meta Length: ${before.metaDescLength} chars`);
    console.log(`Has H1: ${before.hasH1 ? 'Yes' : 'No'}`);
    console.log(`Has Canonical: ${before.hasCanonical ? 'Yes' : 'No'}`);
    console.log(`Has Open Graph: ${before.hasOG ? 'Yes' : 'No'}`);
    console.log(`Has Schema: ${before.hasSchema ? 'Yes' : 'No'}`);

    // STEP 2: Check if widget is installed
    console.log('\n\nSTEP 2: Checking Widget Installation');
    console.log('-'.repeat(80));

    const widgetPatterns = [
      'organitrafficboost.com/api/seo/widget',
      'api.organitrafficboost.com/api/seo/widget'
    ];

    let widgetFound = false;
    let widgetUrl = null;

    $('script').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        for (const pattern of widgetPatterns) {
          if (src.includes(pattern)) {
            widgetFound = true;
            widgetUrl = src;
            return false;
          }
        }
      }
    });

    if (widgetFound) {
      console.log(`\n✅ Widget Found: ${widgetUrl}`);
    } else {
      console.log('\n❌ Widget NOT Found in HTML');
      console.log('⚠️  Fixes will NOT be applied without widget installation');
      console.log('\nPlease add this code to your website:');
      console.log('<script src="https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=jobmakers.in"></script>');
      process.exit(1);
    }

    // STEP 3: Simulate browser execution with JSDOM
    console.log('\n\nSTEP 3: Simulating Browser JavaScript Execution');
    console.log('-'.repeat(80));

    // Create a DOM environment
    const dom = new JSDOM(html, {
      url: url,
      runScripts: "outside-only",
      resources: "usable"
    });

    const { window } = dom;
    const { document } = window;

    // Fetch widget script
    console.log('\nFetching widget script...');
    const widgetResponse = await axios.get(widgetUrl);
    const widgetScript = widgetResponse.data;

    console.log(`✅ Widget script loaded (${widgetScript.length} bytes)`);

    // Execute widget script in the DOM
    console.log('Executing widget JavaScript...\n');
    
    try {
      // Create a safe execution context
      const scriptFunction = new Function('document', 'window', 'console', widgetScript);
      
      // Mock console to capture logs
      const logs = [];
      const mockConsole = {
        log: (...args) => logs.push(args.join(' ')),
        error: (...args) => logs.push('ERROR: ' + args.join(' ')),
        warn: (...args) => logs.push('WARN: ' + args.join(' '))
      };

      // Execute the script
      scriptFunction(document, window, mockConsole);

      // Capture AFTER state
      const after = {
        title: document.title || 'No title',
        titleLength: (document.title || '').length,
        metaDescription: document.querySelector('meta[name="description"]')?.content || 'No meta',
        metaDescLength: (document.querySelector('meta[name="description"]')?.content || '').length,
        hasH1: document.querySelector('h1') !== null,
        hasCanonical: document.querySelector('link[rel="canonical"]') !== null,
        hasOG: document.querySelectorAll('meta[property^="og:"]').length > 0,
        hasSchema: document.querySelector('script[type="application/ld+json"]') !== null
      };

      console.log('✅ Widget executed successfully!\n');

      // Show console logs from widget
      if (logs.length > 0) {
        console.log('📋 Widget Console Output:');
        logs.forEach(log => console.log(`   ${log}`));
        console.log('');
      }

      // STEP 4: Compare BEFORE vs AFTER
      console.log('\nSTEP 4: Comparing BEFORE vs AFTER');
      console.log('-'.repeat(80));

      console.log('\n📊 COMPARISON RESULTS:\n');

      // Title comparison
      if (before.title !== after.title) {
        console.log('✅ Title CHANGED:');
        console.log(`   BEFORE: "${before.title}" (${before.titleLength} chars)`);
        console.log(`   AFTER:  "${after.title}" (${after.titleLength} chars)`);
      } else {
        console.log('⚠️  Title UNCHANGED:');
        console.log(`   "${before.title}" (${before.titleLength} chars)`);
      }

      console.log('');

      // Meta description comparison
      if (before.metaDescription !== after.metaDescription) {
        console.log('✅ Meta Description CHANGED:');
        console.log(`   BEFORE: "${before.metaDescription.substring(0, 50)}..." (${before.metaDescLength} chars)`);
        console.log(`   AFTER:  "${after.metaDescription.substring(0, 50)}..." (${after.metaDescLength} chars)`);
      } else {
        console.log('⚠️  Meta Description UNCHANGED:');
        console.log(`   "${before.metaDescription.substring(0, 50)}..." (${before.metaDescLength} chars)`);
      }

      console.log('');

      // Other elements
      const changes = [];
      if (!before.hasH1 && after.hasH1) changes.push('✅ H1 heading ADDED');
      if (!before.hasCanonical && after.hasCanonical) changes.push('✅ Canonical tag ADDED');
      if (!before.hasOG && after.hasOG) changes.push('✅ Open Graph tags ADDED');
      if (!before.hasSchema && after.hasSchema) changes.push('✅ Schema markup ADDED');

      if (changes.length > 0) {
        console.log('Additional Changes:');
        changes.forEach(change => console.log(`   ${change}`));
      }

      // FINAL VERDICT
      console.log('\n' + '='.repeat(80));
      console.log('📊 FINAL VERDICT');
      console.log('='.repeat(80));

      const totalChanges = (before.title !== after.title ? 1 : 0) +
                          (before.metaDescription !== after.metaDescription ? 1 : 0) +
                          changes.length;

      if (totalChanges > 0) {
        console.log(`\n✅ SUCCESS! ${totalChanges} SEO fixes are being applied!`);
        console.log('\n🎉 Your widget is working correctly!');
        console.log('   - Widget is installed ✅');
        console.log('   - JavaScript is executing ✅');
        console.log('   - Fixes are being applied ✅');
        console.log('   - Users will see the improved version ✅');
      } else {
        console.log('\n⚠️  WARNING: No changes detected');
        console.log('   - Widget is installed ✅');
        console.log('   - But no fixes were applied ❌');
        console.log('   - Check if fixes are marked as "applied" in database');
      }

      console.log('\n' + '='.repeat(80) + '\n');

    } catch (execError) {
      console.error('\n❌ Error executing widget script:', execError.message);
      console.error('Stack:', execError.stack);
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run verification
const testUrl = 'https://jobmakers.in';
verifyFixesApplied(testUrl);
