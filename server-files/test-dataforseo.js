// Test DataForSEO API
require('dotenv').config();
const axios = require('axios');

console.log('🧪 Testing DataForSEO API...\n');

const auth = Buffer.from(
  process.env.DATAFORSEO_LOGIN + ':' + process.env.DATAFORSEO_PASSWORD
).toString('base64');

axios.post(
  'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
  [{
    keyword: 'seo services',
    language_code: 'en',
    location_code: 2840,
    device: 'desktop',
    depth: 10
  }],
  {
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    }
  }
)
.then(res => {
  console.log('✅ DataForSEO API Working!');
  console.log('Found', res.data.tasks[0].result[0].items.length, 'SERP results');
  console.log('\nSample results:');
  res.data.tasks[0].result[0].items.slice(0, 3).forEach((item, i) => {
    console.log(`${i + 1}. ${item.title} - ${item.url}`);
  });
})
.catch(err => {
  console.error('❌ DataForSEO API Error:', err.response?.data || err.message);
});
