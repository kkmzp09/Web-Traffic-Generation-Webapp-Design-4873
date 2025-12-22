// Test auto-fix generation and validation
require('dotenv').config();
const { generateAutoFixesForScan, getCombinedFixScript } = require('./generate-auto-fixes');
const fs = require('fs');

async function testAutoFix() {
  try {
    const scanId = process.argv[2] || 145;
    
    console.log('🧪 Testing Auto-Fix Generation\n');
    console.log(`Scan ID: ${scanId}\n`);
    
    // Step 1: Generate fixes
    console.log('STEP 1: Generating Auto-Fixes');
    console.log('='.repeat(80));
    const result = await generateAutoFixesForScan(scanId);
    
    // Step 2: Get combined script
    console.log('\nSTEP 2: Getting Combined Fix Script');
    console.log('='.repeat(80));
    const combinedScript = await getCombinedFixScript(scanId);
    
    if (combinedScript) {
      // Save to file for inspection
      const filename = `auto-fix-scan-${scanId}.js`;
      fs.writeFileSync(filename, combinedScript);
      console.log(`\n✅ Combined fix script saved to: ${filename}`);
      console.log(`   Script size: ${combinedScript.length} bytes`);
      console.log(`   Fixes included: ${result.fixedCount}`);
      
      // Show preview
      console.log('\n📄 SCRIPT PREVIEW (first 500 chars):');
      console.log('-'.repeat(80));
      console.log(combinedScript.substring(0, 500) + '...');
      console.log('-'.repeat(80));
      
      console.log('\n✅ Auto-fix generation successful!');
      console.log('\n📋 NEXT STEPS:');
      console.log('   1. The fixes are stored in the database');
      console.log('   2. The widget will automatically load and apply these fixes');
      console.log('   3. Visit the website to see fixes applied in real-time');
      console.log(`   4. Check the generated file: ${filename}`);
      
    } else {
      console.log('\n⚠️  No fixes to apply (all issues already have fixes or no fixable issues)');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

testAutoFix();
