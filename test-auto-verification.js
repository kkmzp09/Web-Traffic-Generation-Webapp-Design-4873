// Test automatic verification after applying fixes
const axios = require('axios');

async function testAutoVerification() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING AUTOMATIC AUTO-FIX VERIFICATION');
  console.log('='.repeat(80) + '\n');

  try {
    const scanId = 154;
    const url = 'https://jobmakers.in';
    const domain = 'jobmakers.in';

    // Call verification API
    console.log('Calling verification API...\n');
    
    const response = await axios.post(
      'http://localhost:3001/api/seo/verify-autofix',
      {
        scanId: scanId,
        url: url,
        domain: domain
      }
    );

    const result = response.data;

    console.log('='.repeat(80));
    console.log('📊 VERIFICATION RESULT');
    console.log('='.repeat(80) + '\n');

    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Verified: ${result.verified ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Changes Detected: ${result.changeCount}`);
    console.log(`Message: ${result.message}\n`);

    if (result.changes && result.changes.length > 0) {
      console.log('📋 DETECTED CHANGES:\n');
      result.changes.forEach((change, i) => {
        console.log(`${i + 1}. ${change.field.toUpperCase()}:`);
        if (change.beforeLength !== undefined) {
          console.log(`   BEFORE: ${change.beforeLength} chars`);
          console.log(`   AFTER:  ${change.afterLength} chars`);
        } else {
          console.log(`   BEFORE: ${change.before}`);
          console.log(`   AFTER:  ${change.after}`);
        }
        console.log('');
      });
    }

    if (result.widgetLogs && result.widgetLogs.length > 0) {
      console.log('📋 WIDGET LOGS:\n');
      result.widgetLogs.forEach((log, i) => {
        console.log(`   ${i + 1}. ${log}`);
      });
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('✅ VERIFICATION STORED IN DATABASE');
    console.log('='.repeat(80));
    console.log('\nYou can now query: SELECT * FROM autofix_verifications WHERE scan_id = 154\n');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAutoVerification();
