// Debug widget execution with console capture
const puppeteer = require('puppeteer');

async function debugWidgetExecution() {
  console.log('\n🔍 Debugging Widget Execution with Full Console Capture\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture ALL console logs
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push({
      type: msg.type(),
      text: text
    });
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  console.log('Loading page...\n');
  await page.goto('https://jobmakers.in', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for widget to execute
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get page title after JavaScript execution
  const title = await page.title();
  const titleLength = title.length;

  console.log('='.repeat(80));
  console.log('📋 CONSOLE LOGS (ALL)');
  console.log('='.repeat(80) + '\n');
  
  if (logs.length > 0) {
    logs.forEach((log, i) => {
      console.log(`${i + 1}. [${log.type}] ${log.text}`);
    });
  } else {
    console.log('⚠️  No console logs captured');
  }

  console.log('\n' + '='.repeat(80));
  console.log('❌ JAVASCRIPT ERRORS');
  console.log('='.repeat(80) + '\n');
  
  if (errors.length > 0) {
    errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  } else {
    console.log('✅ No JavaScript errors');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 PAGE STATE AFTER WIDGET');
  console.log('='.repeat(80) + '\n');
  
  console.log(`Title: "${title}"`);
  console.log(`Title Length: ${titleLength} chars`);
  
  // Check if widget logs are present
  const widgetLogs = logs.filter(log => 
    log.text.includes('OrganiTrafficBoost') || 
    log.text.includes('SEO Fix') ||
    log.text.includes('SEO fixes')
  );

  console.log('\n' + '='.repeat(80));
  console.log('🎯 WIDGET-SPECIFIC LOGS');
  console.log('='.repeat(80) + '\n');
  
  if (widgetLogs.length > 0) {
    console.log('✅ Widget logs found:\n');
    widgetLogs.forEach((log, i) => {
      console.log(`${i + 1}. ${log.text}`);
    });
  } else {
    console.log('❌ No widget logs found!');
    console.log('\nPossible reasons:');
    console.log('1. Widget script not loading');
    console.log('2. Domain mismatch check failing');
    console.log('3. JavaScript error preventing execution');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  await browser.close();
}

debugWidgetExecution();
