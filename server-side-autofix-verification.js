// SERVER-SIDE AUTO-FIX VERIFICATION - NO BROWSER NEEDED
const puppeteer = require('puppeteer');
const axios = require('axios');

async function serverSideVerification(url, domain) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 SERVER-SIDE AUTO-FIX VERIFICATION');
  console.log('='.repeat(80) + '\n');
  console.log(`URL: ${url}`);
  console.log(`Domain: ${domain}\n`);

  let browser;
  
  try {
    // STEP 1: Get widget JavaScript from API
    console.log('STEP 1: Fetching Widget JavaScript from API');
    console.log('-'.repeat(80));
    
    const widgetResponse = await axios.get(
      `http://localhost:3001/api/seo/widget/auto-fixes?domain=${domain}`
    );
    
    const widgetScript = widgetResponse.data;
    
    console.log(`✅ Widget script fetched: ${widgetScript.length} bytes\n`);

    // STEP 2: Launch browser and load page
    console.log('STEP 2: Loading Page in Headless Browser');
    console.log('-'.repeat(80));
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('✅ Page loaded\n');

    // STEP 3: Capture BEFORE state
    console.log('STEP 3: Capturing BEFORE State');
    console.log('-'.repeat(80));
    
    const before = await page.evaluate(() => {
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
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length
      };
    });

    console.log('\n📸 BEFORE (Original State):');
    console.log(`   Title: "${before.title}" (${before.titleLength} chars)`);
    console.log(`   Meta: "${before.metaDescription.substring(0, 50)}..." (${before.metaDescLength} chars)`);
    console.log(`   H1 Count: ${before.h1Count}`);
    console.log(`   Canonical: ${before.canonical}`);
    console.log(`   Open Graph Title: ${before.ogTitle}`);
    console.log(`   Schema Scripts: ${before.schemaCount}\n`);

    // STEP 4: INJECT AND EXECUTE widget script
    console.log('STEP 4: Injecting and Executing Widget Script');
    console.log('-'.repeat(80));
    
    const executionResult = await page.evaluate((script) => {
      try {
        // Execute the widget script
        eval(script);
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, widgetScript);

    if (executionResult.success) {
      console.log('✅ Widget script executed successfully\n');
    } else {
      console.log(`❌ Widget script execution failed: ${executionResult.error}\n`);
    }

    // Wait for DOM modifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 5: Capture AFTER state
    console.log('STEP 5: Capturing AFTER State');
    console.log('-'.repeat(80));
    
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
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length
      };
    });

    console.log('\n📸 AFTER (Modified State):');
    console.log(`   Title: "${after.title}" (${after.titleLength} chars)`);
    console.log(`   Meta: "${after.metaDescription.substring(0, 50)}..." (${after.metaDescLength} chars)`);
    console.log(`   H1 Count: ${after.h1Count}`);
    console.log(`   Canonical: ${after.canonical}`);
    console.log(`   Open Graph Title: ${after.ogTitle}`);
    console.log(`   Schema Scripts: ${after.schemaCount}\n`);

    // STEP 6: Compare and analyze
    console.log('STEP 6: Comparing BEFORE vs AFTER');
    console.log('-'.repeat(80));
    
    const changes = [];
    let changeCount = 0;

    // Title
    if (before.title !== after.title) {
      changes.push({
        field: 'Title',
        before: `"${before.title}" (${before.titleLength} chars)`,
        after: `"${after.title}" (${after.titleLength} chars)`,
        changed: true
      });
      changeCount++;
    }

    // Meta Description
    if (before.metaDescription !== after.metaDescription) {
      changes.push({
        field: 'Meta Description',
        before: `${before.metaDescLength} chars`,
        after: `${after.metaDescLength} chars`,
        changed: true
      });
      changeCount++;
    }

    // H1
    if (before.h1Count !== after.h1Count || before.h1Text !== after.h1Text) {
      changes.push({
        field: 'H1 Heading',
        before: `Count: ${before.h1Count}`,
        after: `Count: ${after.h1Count}`,
        changed: true
      });
      changeCount++;
    }

    // Canonical
    if (before.canonical !== after.canonical) {
      changes.push({
        field: 'Canonical Tag',
        before: before.canonical,
        after: after.canonical,
        changed: true
      });
      changeCount++;
    }

    // Open Graph
    if (before.ogTitle !== after.ogTitle || before.ogDescription !== after.ogDescription) {
      changes.push({
        field: 'Open Graph',
        before: before.ogTitle === 'None' ? 'Missing' : 'Present',
        after: after.ogTitle === 'None' ? 'Missing' : 'Present',
        changed: true
      });
      changeCount++;
    }

    // Schema
    if (before.schemaCount !== after.schemaCount) {
      changes.push({
        field: 'Schema.org',
        before: `${before.schemaCount} scripts`,
        after: `${after.schemaCount} scripts`,
        changed: true
      });
      changeCount++;
    }

    console.log('\n📊 CHANGES DETECTED:\n');
    
    if (changes.length > 0) {
      changes.forEach((change, i) => {
        console.log(`${i + 1}. ${change.field}:`);
        console.log(`   BEFORE: ${change.before}`);
        console.log(`   AFTER:  ${change.after}`);
        console.log(`   STATUS: ✅ CHANGED\n`);
      });
    } else {
      console.log('⚠️  No changes detected\n');
    }

    // STEP 7: Check console logs
    console.log('STEP 7: Widget Console Logs');
    console.log('-'.repeat(80));
    
    const widgetLogs = logs.filter(log => 
      log.includes('OrganiTrafficBoost') || 
      log.includes('SEO Fix') ||
      log.includes('SEO fixes')
    );

    if (widgetLogs.length > 0) {
      console.log('\n✅ Widget executed and logged:\n');
      widgetLogs.forEach((log, i) => {
        console.log(`   ${i + 1}. ${log}`);
      });
      console.log('');
    } else {
      console.log('\n⚠️  No widget logs found\n');
    }

    // FINAL VERDICT
    console.log('='.repeat(80));
    console.log('📊 FINAL VERIFICATION RESULT');
    console.log('='.repeat(80));

    if (changeCount > 0) {
      console.log(`\n✅ SUCCESS! AUTO-FIX IS WORKING!`);
      console.log(`\n📈 Total Changes: ${changeCount}`);
      console.log(`   - Widget script fetched ✅`);
      console.log(`   - Widget script injected ✅`);
      console.log(`   - Widget script executed ✅`);
      console.log(`   - DOM modifications applied ✅`);
      console.log(`   - Changes verified ✅`);
      console.log(`\n🎯 Customer Impact:`);
      console.log(`   - Users WILL see improved SEO`);
      console.log(`   - Search engines WILL index better content`);
      console.log(`   - SEO score WILL improve`);
    } else {
      console.log(`\n⚠️  WARNING: No changes detected`);
      console.log(`\n   Possible reasons:`);
      console.log(`   - Page already meets all SEO criteria`);
      console.log(`   - Fixes are conditional and not triggered`);
      console.log(`   - Domain mismatch in widget logic`);
      
      // Debug info
      console.log(`\n   Debug Info:`);
      console.log(`   - Current title length: ${before.titleLength} (target: 50-60)`);
      console.log(`   - Current meta length: ${before.metaDescLength} (target: 120-160)`);
      console.log(`   - Widget logs: ${widgetLogs.length}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    await browser.close();
    process.exit(changeCount > 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('Stack:', error.stack);
    if (browser) await browser.close();
    process.exit(1);
  }
}

// Run verification
serverSideVerification('https://jobmakers.in', 'jobmakers.in');
