// Test widget validation
const axios = require('axios');

async function testValidation() {
  console.log('\n🧪 Testing Widget Validation\n');
  
  try {
    const response = await axios.post(
      'http://localhost:3001/api/seo/validate-widget-strict',
      {
        url: 'https://jobmakers.in',
        domain: 'jobmakers.in'
      }
    );

    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.widgetInstalled) {
      console.log('\n✅ Widget is installed!');
      console.log(`   Type: ${response.data.widgetType}`);
      console.log(`   URL: ${response.data.widgetUrl}`);
    } else {
      console.log('\n❌ Widget NOT installed');
      console.log(`   Message: ${response.data.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testValidation();
