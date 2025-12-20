// test-cheerio-scanner.js
// Test script for Cheerio page scanner

const cheerioScanner = require('./cheerio-page-scanner');

async function testScanner() {
  console.log('🧪 Testing Cheerio Page Scanner\n');
  
  // Test URLs
  const testUrls = [
    'https://example.com',
    'https://www.wikipedia.org'
  ];
  
  for (const url of testUrls) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${url}`);
    console.log('='.repeat(60));
    
    const result = await cheerioScanner.scanPageHTML(url);
    
    if (result.success) {
      console.log('\n✅ Scan successful!');
      console.log(`\nPage Metadata:`);
      console.log(`- Title: ${result.pageTitle}`);
      console.log(`- Meta Description: ${result.metaDescription?.substring(0, 100)}...`);
      console.log(`- H1 Tags: ${result.h1Tags.length} found`);
      console.log(`- Images: ${result.imageCount} total, ${result.imagesWithoutAlt} without alt`);
      console.log(`- Has Canonical: ${result.hasCanonical}`);
      console.log(`- Is Noindex: ${result.isNoindex}`);
      
      console.log(`\n📋 Issues Detected: ${result.issues.length}`);
      result.issues.forEach((issue, idx) => {
        const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡';
        const fixBadge = issue.fixable ? '[FIXABLE]' : '';
        console.log(`${idx + 1}. ${icon} ${issue.title} ${fixBadge}`);
        console.log(`   Type: ${issue.type}`);
        console.log(`   Description: ${issue.description}`);
        if (issue.fixType) {
          console.log(`   Fix Type: ${issue.fixType}`);
        }
      });
    } else {
      console.log(`\n❌ Scan failed: ${result.error}`);
    }
  }
  
  console.log('\n\n✅ Test complete!');
}

// Run test
testScanner().catch(console.error);
