// Check if widget is actually loading in real browser
const puppeteer = require('puppeteer');

async function checkWidgetInBrowser() {
  console.log('\n🔍 Checking Widget in Real Browser Environment\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture ALL console logs
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`[BROWSER] ${text}`);
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });

  // Track network requests for widget
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('auto-fixes')) {
      console.log(`\n📡 Widget Script Response:`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${response.status()}`);
      console.log(`   Content-Type: ${response.headers()['content-type']}`);
      
      try {
        const body = await response.text();
        console.log(`   Size: ${body.length} bytes`);
        console.log(`   Preview: ${body.substring(0, 200)}...\n`);
      } catch (e) {
        console.log(`   Could not read body\n`);
      }
    }
  });

  console.log('Loading page...\n');
  await page.goto('https://jobmakers.in', { waitUntil: 'networkidle0', timeout: 30000 });
  
  console.log('\nWaiting 5 seconds for widget to execute...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Check title
  const title = await page.title();
  console.log('='.repeat(80));
  console.log('📊 FINAL CHECK');
  console.log('='.repeat(80));
  console.log(`\nBrowser Tab Title: "${title}"`);
  console.log(`Title Length: ${title.length} chars`);
  
  if (title.length === 60 && title.includes('...')) {
    console.log('✅ WIDGET IS WORKING! Title was shortened!\n');
  } else if (title.length === 62) {
    console.log('❌ WIDGET NOT WORKING! Title is still 62 chars (original)\n');
  }

  // Check if widget logs are present
  const widgetLogs = logs.filter(log => 
    log.includes('OrganiTrafficBoost') || 
    log.includes('SEO Fix')
  );

  console.log('Widget Logs Found: ' + widgetLogs.length);
  if (widgetLogs.length > 0) {
    console.log('\n✅ Widget executed successfully!\n');
  } else {
    console.log('\n❌ Widget did NOT execute!\n');
    console.log('Possible reasons:');
    console.log('1. Widget script not loading');
    console.log('2. JavaScript error preventing execution');
    console.log('3. Domain mismatch check failing\n');
  }

  console.log('='.repeat(80) + '\n');
  
  // Keep browser open for manual inspection
  console.log('Browser will stay open for 30 seconds for manual inspection...\n');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await browser.close();
}

checkWidgetInBrowser();
