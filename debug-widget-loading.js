// Debug widget loading in browser
const puppeteer = require('puppeteer');

async function debugWidgetLoading(url) {
  console.log('\n🔍 Debugging Widget Loading\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture all network requests
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('widget') || request.url().includes('auto-fixes')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        type: request.resourceType()
      });
    }
  });

  // Capture all responses
  const responses = [];
  page.on('response', async response => {
    if (response.url().includes('widget') || response.url().includes('auto-fixes')) {
      const contentType = response.headers()['content-type'];
      let body = '';
      try {
        body = await response.text();
      } catch (e) {
        body = 'Could not read body';
      }
      responses.push({
        url: response.url(),
        status: response.status(),
        contentType,
        bodyLength: body.length,
        bodyPreview: body.substring(0, 200)
      });
    }
  });

  // Capture console logs
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  // Capture JavaScript errors
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  console.log('Loading page...\n');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('='.repeat(80));
  console.log('📡 NETWORK REQUESTS');
  console.log('='.repeat(80));
  if (requests.length > 0) {
    requests.forEach((req, i) => {
      console.log(`\n${i + 1}. ${req.method} ${req.url}`);
      console.log(`   Type: ${req.type}`);
    });
  } else {
    console.log('\n❌ No widget requests found!');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📥 NETWORK RESPONSES');
  console.log('='.repeat(80));
  if (responses.length > 0) {
    responses.forEach((res, i) => {
      console.log(`\n${i + 1}. ${res.url}`);
      console.log(`   Status: ${res.status}`);
      console.log(`   Content-Type: ${res.contentType}`);
      console.log(`   Body Length: ${res.bodyLength} bytes`);
      console.log(`   Preview: ${res.bodyPreview}...`);
    });
  } else {
    console.log('\n❌ No widget responses found!');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 CONSOLE LOGS');
  console.log('='.repeat(80));
  if (logs.length > 0) {
    logs.forEach((log, i) => {
      console.log(`${i + 1}. ${log}`);
    });
  } else {
    console.log('\n⚠️  No console logs');
  }

  console.log('\n' + '='.repeat(80));
  console.log('❌ JAVASCRIPT ERRORS');
  console.log('='.repeat(80));
  if (errors.length > 0) {
    errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ No JavaScript errors');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  await browser.close();
}

debugWidgetLoading('https://jobmakers.in');
