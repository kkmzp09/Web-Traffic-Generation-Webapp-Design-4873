// Test scan directly from backend
const axios = require('axios');

async function testScan() {
  try {
    console.log('🧪 Testing SEO scan from backend...\n');
    
    // Step 1: Start scan
    console.log('1️⃣ Starting scan for jobmakers.in...');
    const scanResponse = await axios.post('http://localhost:3001/api/seo/scan-page', {
      url: 'https://jobmakers.in',
      userId: '00000000-0000-0000-0000-000000000000' // Default test user
    });
    
    if (!scanResponse.data.success) {
      console.error('❌ Scan failed to start:', scanResponse.data);
      return;
    }
    
    const scanId = scanResponse.data.scanId;
    console.log(`✅ Scan started! Scan ID: ${scanId}`);
    console.log(`   Page limit: ${scanResponse.data.pageLimit}`);
    console.log(`   Status: ${scanResponse.data.status}\n`);
    
    // Step 2: Wait and monitor progress
    console.log('2️⃣ Monitoring scan progress...\n');
    
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;
      
      try {
        const statusResponse = await axios.get(
          `http://localhost:3001/api/seo/scan/${scanId}?userId=00000000-0000-0000-0000-000000000000`
        );
        
        if (statusResponse.data.success) {
          const scan = statusResponse.data.scan;
          const issues = statusResponse.data.issues || [];
          
          console.log(`[${attempts * 2}s] Status: ${scan.status}`);
          console.log(`       SEO Score: ${scan.seo_score || 'calculating...'}`);
          console.log(`       Issues found: ${issues.length}`);
          console.log(`       Critical: ${scan.critical_issues || 0}, Warnings: ${scan.warnings || 0}, Passed: ${scan.passed_checks || 0}\n`);
          
          if (scan.status === 'completed') {
            completed = true;
            console.log('✅ Scan completed!\n');
            console.log('📊 Final Results:');
            console.log(`   SEO Score: ${scan.seo_score}/100`);
            console.log(`   Total Issues: ${issues.length}`);
            console.log(`   Critical: ${scan.critical_issues}`);
            console.log(`   Warnings: ${scan.warnings}`);
            console.log(`   Passed Checks: ${scan.passed_checks}`);
            console.log(`   Scanned At: ${scan.scanned_at}\n`);
            
            if (issues.length > 0) {
              console.log('🔍 Sample Issues (first 5):');
              issues.slice(0, 5).forEach((issue, idx) => {
                console.log(`   ${idx + 1}. [${issue.severity}] ${issue.title}`);
                console.log(`      Category: ${issue.category}`);
                console.log(`      Page: ${issue.page_url}\n`);
              });
            }
          }
        }
      } catch (error) {
        console.log(`[${attempts * 2}s] Waiting... (${error.response?.status || error.message})`);
      }
    }
    
    if (!completed) {
      console.log('⚠️ Scan did not complete within 60 seconds');
      console.log('   This might be normal for larger sites');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testScan();
