// Check if widget script is actually loading
const puppeteer = require('puppeteer');

async function checkScriptLoading() {
  console.log('\n🔍 Checking if Widget Script is Loading\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Track all script requests
  const scriptRequests = [];
  page.on('request', request => {
    if (request.resourceType() === 'script') {
      scriptRequests.push({
        url: request.url(),
        method: request.method()
      });
    }
  });

  // Track all script responses
  const scriptResponses = [];
  page.on('response', async response => {
    if (response.request().resourceType() === 'script') {
      const url = response.url();
      const status = response.status();
      const contentType = response.headers()['content-type'];
      
      scriptResponses.push({
        url,
        status,
        contentType
      });
    }
  });

  await page.goto('https://jobmakers.in', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('='.repeat(80));
  console.log('📡 SCRIPT REQUESTS');
  console.log('='.repeat(80) + '\n');
  
  const widgetRequests = scriptRequests.filter(r => r.url.includes('auto-fixes'));
  
  if (widgetRequests.length > 0) {
    console.log('✅ Widget script requested:\n');
    widgetRequests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.url}`);
    });
  } else {
    console.log('❌ Widget script NOT requested!');
    console.log('\nThis means the script tag is not in the HTML or browser is not loading it.');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📥 SCRIPT RESPONSES');
  console.log('='.repeat(80) + '\n');
  
  const widgetResponses = scriptResponses.filter(r => r.url.includes('auto-fixes'));
  
  if (widgetResponses.length > 0) {
    console.log('✅ Widget script loaded:\n');
    widgetResponses.forEach((res, i) => {
      console.log(`${i + 1}. ${res.url}`);
      console.log(`   Status: ${res.status}`);
      console.log(`   Content-Type: ${res.contentType}\n`);
    });
  } else {
    console.log('❌ Widget script NOT loaded!');
  }

  console.log('='.repeat(80) + '\n');

  await browser.close();
}

checkScriptLoading();
