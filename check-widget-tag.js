// Check what widget script tag is on the page
const axios = require('axios');
const cheerio = require('cheerio');

async function checkWidgetTag() {
  console.log('\n🔍 Checking Widget Script Tag on Page\n');
  
  const response = await axios.get('https://jobmakers.in');
  const $ = cheerio.load(response.data);
  
  console.log('='.repeat(80));
  console.log('WIDGET SCRIPT TAGS FOUND:');
  console.log('='.repeat(80) + '\n');
  
  let found = false;
  
  $('script').each((i, elem) => {
    const src = $(elem).attr('src');
    if (src && (src.includes('widget') || src.includes('organitrafficboost'))) {
      found = true;
      console.log(`${i + 1}. ${src}`);
      
      if (src.includes('auto-fixes')) {
        console.log('   ✅ CORRECT - This is the auto-fix widget!\n');
      } else {
        console.log('   ❌ WRONG - This is NOT the auto-fix widget!\n');
      }
    }
  });
  
  if (!found) {
    console.log('❌ No widget script tags found!\n');
  }
  
  console.log('='.repeat(80));
  console.log('EXPECTED WIDGET TAG:');
  console.log('='.repeat(80));
  console.log('\n<script src="https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=jobmakers.in"></script>\n');
  console.log('='.repeat(80) + '\n');
}

checkWidgetTag();
