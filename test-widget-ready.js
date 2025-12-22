// Test if widget is ready to be installed
const axios = require('axios');

async function testWidgetReady() {
  console.log('\n🧪 Testing Widget API Readiness\n');
  console.log('='.repeat(80));
  
  try {
    const response = await axios.get(
      'http://localhost:3001/api/seo/widget/auto-fixes?domain=jobmakers.in'
    );

    console.log('\n✅ Widget API Response:\n');
    console.log(`Domain: ${response.data.domain}`);
    console.log(`Scan ID: ${response.data.scanId}`);
    console.log(`Fix Count: ${response.data.fixCount}`);
    console.log(`Script Size: ${response.data.script?.length || 0} bytes`);
    console.log(`Success: ${response.data.success}`);
    
    if (response.data.fixCount > 0) {
      console.log('\n✅ WIDGET IS READY TO INSTALL!\n');
      console.log('📋 Installation Instructions:\n');
      console.log('1. Add this code to jobmakers.in:');
      console.log('');
      console.log('   <script src="https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=jobmakers.in"></script>');
      console.log('');
      console.log('2. Place it in <head> section or before </body>');
      console.log('3. Save and deploy to your website');
      console.log('4. Visit jobmakers.in in browser');
      console.log('5. Check browser tab title - it should change!');
      console.log('');
      console.log('='.repeat(80));
      console.log(`\n🎯 Widget will apply ${response.data.fixCount} fixes automatically!\n`);
    } else {
      console.log('\n❌ NO FIXES AVAILABLE');
      console.log('Run a scan first to generate fixes.\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testWidgetReady();
