// Campaign Analysis Script for Job ID: 1762494336711
// This script analyzes the campaign data from multiple sources

const jobId = '1762494336711';

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 CAMPAIGN ANALYSIS REPORT');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Job ID: ${jobId}`);
console.log(`Analysis Time: ${new Date().toLocaleString()}`);
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Check localStorage for campaign data
console.log('📦 CHECKING LOCAL STORAGE');
console.log('─────────────────────────────────────────────────────────────');

const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
console.log(`User ID: ${userId || 'NOT FOUND'}`);

if (userId) {
  const campaignsKey = `campaigns_${userId}`;
  const campaignsData = localStorage.getItem(campaignsKey);
  
  if (campaignsData) {
    try {
      const campaigns = JSON.parse(campaignsData);
      console.log(`Total campaigns in storage: ${campaigns.length}`);
      
      // Find the specific campaign
      const targetCampaign = campaigns.find(c => 
        c.id === jobId || 
        c.id === parseInt(jobId) || 
        c.jobId === jobId || 
        c.jobId === parseInt(jobId)
      );
      
      if (targetCampaign) {
        console.log('\n✅ CAMPAIGN FOUND IN LOCAL STORAGE!\n');
        console.log('Campaign Details:');
        console.log('─────────────────────────────────────────────────────────────');
        console.log(JSON.stringify(targetCampaign, null, 2));
        console.log('─────────────────────────────────────────────────────────────\n');
        
        // Detailed breakdown
        console.log('📊 CAMPAIGN METRICS:');
        console.log('─────────────────────────────────────────────────────────────');
        console.log(`Type: ${targetCampaign.type || 'N/A'}`);
        console.log(`Target URL: ${targetCampaign.url || targetCampaign.targetUrl || 'N/A'}`);
        console.log(`Total Visitors: ${targetCampaign.visitors || 'N/A'}`);
        console.log(`Duration: ${targetCampaign.duration || 'N/A'} minutes`);
        console.log(`Status: ${targetCampaign.status || 'N/A'}`);
        console.log(`Created: ${targetCampaign.timestamp || targetCampaign.createdAt || 'N/A'}`);
        
        if (targetCampaign.results) {
          console.log('\n📈 RESULTS:');
          console.log('─────────────────────────────────────────────────────────────');
          console.log(`Total: ${targetCampaign.results.total || 0}`);
          console.log(`Completed: ${targetCampaign.results.completed || 0}`);
          console.log(`In Progress: ${targetCampaign.results.inProgress || 0}`);
          console.log(`Failed: ${targetCampaign.results.failed || 0}`);
          
          if (targetCampaign.results.pagesVisited) {
            console.log(`Pages Visited: ${targetCampaign.results.pagesVisited}`);
          }
          
          // Calculate completion percentage
          const total = targetCampaign.results.total || targetCampaign.visitors || 0;
          const completed = targetCampaign.results.completed || 0;
          if (total > 0) {
            const percentage = ((completed / total) * 100).toFixed(2);
            console.log(`Completion Rate: ${percentage}%`);
          }
        }
        
        if (targetCampaign.config) {
          console.log('\n⚙️ CONFIGURATION:');
          console.log('─────────────────────────────────────────────────────────────');
          console.log(JSON.stringify(targetCampaign.config, null, 2));
        }
        
      } else {
        console.log('\n❌ Campaign not found in local storage');
        console.log('\n📋 Recent campaigns (showing first 10):');
        campaigns.slice(0, 10).forEach((c, i) => {
          console.log(`${i + 1}. ID: ${c.id || c.jobId}, Type: ${c.type}, URL: ${c.url || c.targetUrl}, Status: ${c.status}`);
        });
      }
    } catch (err) {
      console.error('Error parsing campaigns data:', err);
    }
  } else {
    console.log('❌ No campaigns data found in localStorage');
  }
} else {
  console.log('❌ User ID not found in localStorage');
}

// 2. Check for proxy configuration
console.log('\n\n🔒 PROXY CONFIGURATION');
console.log('─────────────────────────────────────────────────────────────');

const ownedProxies = JSON.parse(localStorage.getItem('ownedProxies') || '[]');
console.log(`Total proxies configured: ${ownedProxies.length}`);

if (ownedProxies.length > 0) {
  console.log('\n📋 Proxy List:');
  ownedProxies.forEach((proxy, i) => {
    console.log(`${i + 1}. ${proxy.ip}:${proxy.port} - ${proxy.country} (${proxy.status})`);
    if (proxy.ip && proxy.ip.includes('smartproxy')) {
      console.log('   ⭐ SmartProxy Detected');
    }
  });
  
  const smartProxy = ownedProxies.find(p => p.ip && p.ip.includes('smartproxy'));
  if (smartProxy) {
    console.log('\n✅ SmartProxy Configuration:');
    console.log(JSON.stringify(smartProxy, null, 2));
  }
}

// 3. Check server configuration
console.log('\n\n🖥️ SERVER CONFIGURATION');
console.log('─────────────────────────────────────────────────────────────');

const serverConfig = localStorage.getItem('serverConfig');
if (serverConfig) {
  try {
    const config = JSON.parse(serverConfig);
    console.log(`Server Host: ${config.host || 'N/A'}`);
    console.log(`Server Port: ${config.port || 'N/A'}`);
    console.log(`Protocol: ${config.protocol || 'http'}`);
    console.log(`API Key: ${config.apiKey ? '***' + config.apiKey.slice(-4) : 'N/A'}`);
  } catch (err) {
    console.error('Error parsing server config:', err);
  }
} else {
  console.log('No server configuration found');
}

// 4. Instructions for VPS check
console.log('\n\n🔧 VPS SERVER CHECK');
console.log('─────────────────────────────────────────────────────────────');
console.log('To check the campaign on your VPS server (67.217.60.57):');
console.log('');
console.log('1. SSH into your VPS:');
console.log('   ssh root@67.217.60.57');
console.log('');
console.log('2. Check PM2 logs:');
console.log('   pm2 logs relay-api --lines 100');
console.log('');
console.log('3. Check campaign file (if VPS campaign tracker is installed):');
console.log('   cat /root/relay/campaigns.json | grep "1762494336711"');
console.log('');
console.log('4. Check campaign results:');
console.log(`   curl http://localhost:3001/results/${jobId}`);
console.log('');
console.log('5. Check campaign status:');
console.log(`   curl http://localhost:3001/status/${jobId}`);
console.log('');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📝 SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log('This analysis checked:');
console.log('✓ Local storage for campaign data');
console.log('✓ Proxy configuration');
console.log('✓ Server configuration');
console.log('');
console.log('For real-time server data, you need to:');
console.log('1. Access your VPS at 67.217.60.57');
console.log('2. Check PM2 logs and campaign tracker files');
console.log('3. Query the relay API directly');
console.log('═══════════════════════════════════════════════════════════\n');
