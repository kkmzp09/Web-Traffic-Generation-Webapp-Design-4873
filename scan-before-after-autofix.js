// Scan page BEFORE and AFTER auto-fix to verify changes
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
require('dotenv').config();

async function scanBeforeAfter(url) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 BEFORE/AFTER AUTO-FIX VERIFICATION SCAN');
  console.log('='.repeat(80) + '\n');
  console.log(`URL: ${url}\n`);

  let browser;
  
  try {
    // STEP 1: Scan BEFORE (Original HTML from server)
    console.log('STEP 1: Scanning BEFORE State (Original HTML)');
    console.log('-'.repeat(80));

    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)' }
    });

    const $ = cheerio.load(response.data);

    const before = {
      title: $('title').text() || '',
      titleLength: ($('title').text() || '').length,
      metaDescription: $('meta[name="description"]').attr('content') || '',
      metaDescLength: ($('meta[name="description"]').attr('content') || '').length,
      h1Count: $('h1').length,
      h1Text: $('h1').first().text() || 'None',
      canonical: $('link[rel="canonical"]').attr('href') || 'None',
      ogTitle: $('meta[property="og:title"]').attr('content') || 'None',
      ogDescription: $('meta[property="og:description"]').attr('content') || 'None',
      ogUrl: $('meta[property="og:url"]').attr('content') || 'None',
      ogType: $('meta[property="og:type"]').attr('content') || 'None',
      ogImage: $('meta[property="og:image"]').attr('content') || 'None',
      schemaCount: $('script[type="application/ld+json"]').length,
      hasWidget: response.data.includes('organitrafficboost.com/api/seo/widget')
    };

    console.log('\n📸 BEFORE (Server HTML - No JavaScript):\n');
    console.log(`Title: "${before.title}"`);
    console.log(`Title Length: ${before.titleLength} chars`);
    console.log(`Meta Description: "${before.metaDescription.substring(0, 60)}..."`);
    console.log(`Meta Length: ${before.metaDescLength} chars`);
    console.log(`H1 Count: ${before.h1Count}`);
    console.log(`H1 Text: "${before.h1Text}"`);
    console.log(`Canonical: ${before.canonical}`);
    console.log(`Open Graph Title: ${before.ogTitle}`);
    console.log(`Open Graph Description: ${before.ogDescription}`);
    console.log(`Open Graph URL: ${before.ogUrl}`);
    console.log(`Open Graph Type: ${before.ogType}`);
    console.log(`Open Graph Image: ${before.ogImage}`);
    console.log(`Schema.org Scripts: ${before.schemaCount}`);
    console.log(`Widget Installed: ${before.hasWidget ? 'Yes ✅' : 'No ❌'}`);

    if (!before.hasWidget) {
      console.log('\n❌ Widget not installed! Cannot verify auto-fix.\n');
      console.log('='.repeat(80) + '\n');
      process.exit(1);
    }

    // STEP 2: Scan AFTER (Using Puppeteer to execute JavaScript)
    console.log('\n\nSTEP 2: Scanning AFTER State (With JavaScript Execution)');
    console.log('-'.repeat(80));
    console.log('\nLaunching headless browser...');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Capture console logs from the page
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('SEO Fix Applied') || text.includes('SEO Fixes Applied')) {
        consoleLogs.push(text);
      }
    });

    console.log('Loading page with JavaScript execution...');
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for widget to execute
    console.log('Waiting for widget to execute (2 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract AFTER state
    const after = await page.evaluate(() => {
      return {
        title: document.title || '',
        titleLength: (document.title || '').length,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        metaDescLength: (document.querySelector('meta[name="description"]')?.content || '').length,
        h1Count: document.querySelectorAll('h1').length,
        h1Text: document.querySelector('h1')?.textContent || 'None',
        canonical: document.querySelector('link[rel="canonical"]')?.href || 'None',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || 'None',
        ogDescription: document.querySelector('meta[property="og:description"]')?.content || 'None',
        ogUrl: document.querySelector('meta[property="og:url"]')?.content || 'None',
        ogType: document.querySelector('meta[property="og:type"]')?.content || 'None',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || 'None',
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length
      };
    });

    console.log('\n📸 AFTER (Browser DOM - With JavaScript):\n');
    console.log(`Title: "${after.title}"`);
    console.log(`Title Length: ${after.titleLength} chars`);
    console.log(`Meta Description: "${after.metaDescription.substring(0, 60)}..."`);
    console.log(`Meta Length: ${after.metaDescLength} chars`);
    console.log(`H1 Count: ${after.h1Count}`);
    console.log(`H1 Text: "${after.h1Text}"`);
    console.log(`Canonical: ${after.canonical}`);
    console.log(`Open Graph Title: ${after.ogTitle}`);
    console.log(`Open Graph Description: ${after.ogDescription}`);
    console.log(`Open Graph URL: ${after.ogUrl}`);
    console.log(`Open Graph Type: ${after.ogType}`);
    console.log(`Open Graph Image: ${after.ogImage}`);
    console.log(`Schema.org Scripts: ${after.schemaCount}`);

    if (consoleLogs.length > 0) {
      console.log('\n📋 Widget Console Output:');
      consoleLogs.forEach(log => console.log(`   ${log}`));
    }

    // STEP 3: Compare and analyze changes
    console.log('\n\nSTEP 3: Comparing BEFORE vs AFTER');
    console.log('-'.repeat(80));

    const changes = [];
    let changeCount = 0;

    // Title comparison
    if (before.title !== after.title) {
      changes.push({
        field: 'Title',
        before: `"${before.title}" (${before.titleLength} chars)`,
        after: `"${after.title}" (${after.titleLength} chars)`,
        status: 'CHANGED ✅'
      });
      changeCount++;
    } else {
      changes.push({
        field: 'Title',
        before: `"${before.title}" (${before.titleLength} chars)`,
        after: 'Same as before',
        status: 'UNCHANGED'
      });
    }

    // Meta description comparison
    if (before.metaDescription !== after.metaDescription) {
      changes.push({
        field: 'Meta Description',
        before: `${before.metaDescLength} chars`,
        after: `${after.metaDescLength} chars`,
        status: 'CHANGED ✅'
      });
      changeCount++;
    } else {
      changes.push({
        field: 'Meta Description',
        before: `${before.metaDescLength} chars`,
        after: 'Same as before',
        status: 'UNCHANGED'
      });
    }

    // H1 comparison
    if (before.h1Count !== after.h1Count || before.h1Text !== after.h1Text) {
      changes.push({
        field: 'H1 Heading',
        before: `Count: ${before.h1Count}, Text: "${before.h1Text}"`,
        after: `Count: ${after.h1Count}, Text: "${after.h1Text}"`,
        status: 'CHANGED ✅'
      });
      changeCount++;
    }

    // Canonical comparison
    if (before.canonical !== after.canonical) {
      changes.push({
        field: 'Canonical Tag',
        before: before.canonical,
        after: after.canonical,
        status: 'CHANGED ✅'
      });
      changeCount++;
    }

    // Open Graph comparison
    if (before.ogTitle !== after.ogTitle || before.ogDescription !== after.ogDescription) {
      changes.push({
        field: 'Open Graph Tags',
        before: `Title: ${before.ogTitle === 'None' ? 'Missing' : 'Present'}`,
        after: `Title: ${after.ogTitle === 'None' ? 'Missing' : 'Present'}`,
        status: before.ogTitle === 'None' && after.ogTitle !== 'None' ? 'ADDED ✅' : 'CHANGED ✅'
      });
      changeCount++;
    }

    // Schema comparison
    if (before.schemaCount !== after.schemaCount) {
      changes.push({
        field: 'Schema.org Markup',
        before: `${before.schemaCount} scripts`,
        after: `${after.schemaCount} scripts`,
        status: 'CHANGED ✅'
      });
      changeCount++;
    }

    // Display changes
    console.log('\n📊 DETAILED COMPARISON:\n');
    changes.forEach((change, i) => {
      console.log(`${i + 1}. ${change.field}:`);
      console.log(`   BEFORE: ${change.before}`);
      console.log(`   AFTER:  ${change.after}`);
      console.log(`   STATUS: ${change.status}\n`);
    });

    // STEP 4: Final verdict
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION RESULT');
    console.log('='.repeat(80));

    if (changeCount > 0) {
      console.log(`\n✅ SUCCESS! Auto-fix is working!`);
      console.log(`\n📈 Changes Detected: ${changeCount}`);
      console.log(`   - Widget is installed ✅`);
      console.log(`   - JavaScript is executing ✅`);
      console.log(`   - SEO fixes are being applied ✅`);
      console.log(`   - Changes are visible in browser ✅`);
      console.log(`\n🎯 Customer Impact:`);
      console.log(`   - Users will see the improved version`);
      console.log(`   - Search engines will index the fixed version`);
      console.log(`   - SEO score will improve`);
    } else {
      console.log(`\n⚠️  WARNING: No changes detected`);
      console.log(`   - Widget is installed ✅`);
      console.log(`   - But no fixes were applied ❌`);
      console.log(`\n   Possible reasons:`);
      console.log(`   - No fixes marked as "applied" in database`);
      console.log(`   - Widget API not returning fixes`);
      console.log(`   - JavaScript errors preventing execution`);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    await browser.close();
    process.exit(changeCount > 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Scan failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

// Run scan
const testUrl = 'https://jobmakers.in';
scanBeforeAfter(testUrl);
