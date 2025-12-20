// Check Campaign Details for Job ID: 1762420823354
// Run this in your browser console on the app page

console.log('🔍 Checking Campaign Job ID: 1762420823354\n');

// 1. Check localStorage for campaign data
const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
console.log('📋 User ID:', userId);

if (userId) {
  const campaignsKey = `campaigns_${userId}`;
  const campaigns = JSON.parse(localStorage.getItem(campaignsKey) || '[]');
  
  console.log(`\n📊 Total campaigns found: ${campaigns.length}`);
  
  // Find the specific campaign
  const targetCampaign = campaigns.find(c => c.id === '1762420823354' || c.id === 1762420823354);
  
  if (targetCampaign) {
    console.log('\n✅ CAMPAIGN FOUND!\n');
    console.log('Campaign Details:');
    console.log('================');
    console.log('Job ID:', targetCampaign.id);
    console.log('Type:', targetCampaign.type);
    console.log('URL:', targetCampaign.url);
    console.log('Visitors:', targetCampaign.visitors);
    console.log('Duration:', targetCampaign.duration, 'minutes');
    console.log('Status:', targetCampaign.status);
    console.log('Timestamp:', targetCampaign.timestamp);
    
    if (targetCampaign.results) {
      console.log('\n📈 Results:');
      console.log('Total:', targetCampaign.results.total);
      console.log('Completed:', targetCampaign.results.completed);
      console.log('In Progress:', targetCampaign.results.inProgress);
      console.log('Failed:', targetCampaign.results.failed);
      if (targetCampaign.results.pagesVisited) {
        console.log('Pages Visited:', targetCampaign.results.pagesVisited);
      }
    }
    
    console.log('\n📦 Full Campaign Object:');
    console.log(JSON.stringify(targetCampaign, null, 2));
  } else {
    console.log('\n❌ Campaign not found in localStorage');
    console.log('\n📋 Recent campaigns:');
    campaigns.slice(0, 5).forEach((c, i) => {
      console.log(`${i + 1}. ID: ${c.id}, Type: ${c.type}, URL: ${c.url}, Status: ${c.status}`);
    });
  }
}

// 2. Check for proxy assignments
console.log('\n\n🔒 PROXY INFORMATION:');
console.log('===================');

const ownedProxies = JSON.parse(localStorage.getItem('ownedProxies') || '[]');
console.log(`Total proxies loaded: ${ownedProxies.length}`);

if (ownedProxies.length > 0) {
  console.log('\n📋 Proxy List:');
  ownedProxies.forEach((proxy, i) => {
    console.log(`${i + 1}. ${proxy.ip}:${proxy.port} - ${proxy.country} (${proxy.status})`);
    if (proxy.ip && proxy.ip.includes('smartproxy')) {
      console.log('   ⭐ SMARTPROXY DETECTED!');
    }
  });
  
  // Check for SmartProxy specifically
  const smartProxy = ownedProxies.find(p => p.ip && p.ip.includes('smartproxy'));
  if (smartProxy) {
    console.log('\n✅ SmartProxy Configuration Found:');
    console.log(JSON.stringify(smartProxy, null, 2));
  } else {
    console.log('\n⚠️ No SmartProxy found in uploaded proxies');
  }
} else {
  console.log('❌ No proxies found in localStorage');
}

// 3. Check session storage for active sessions
console.log('\n\n🎬 ACTIVE SESSIONS:');
console.log('==================');

// Check for any session data
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && key.includes('1762420823354')) {
    console.log(`Found session data for key: ${key}`);
    console.log(sessionStorage.getItem(key));
  }
}

console.log('\n\n💡 IMPORTANT NOTE:');
console.log('=================');
console.log('Direct Traffic campaigns do NOT use proxies by default.');
console.log('Proxies are only used in:');
console.log('  - Enhanced Playwright Campaigns');
console.log('  - Real Browser Automation');
console.log('\nTo check server logs, you need to SSH into your VPS at 67.217.60.57');
console.log('and run: pm2 logs relay-api --lines 100');
