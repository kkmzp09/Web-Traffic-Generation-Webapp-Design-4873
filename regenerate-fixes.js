// Regenerate fixes with new intelligent title shortening
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function regenerateFixes() {
  const scanId = 156;
  const userId = '80983ba6-0297-4a46-8bfb-cedba44e6bc7';

  console.log('\n🔄 Regenerating fixes for Scan ID:', scanId);
  
  try {
    // Delete old fixes
    console.log('\n1. Deleting old fixes...');
    const deleteResult = await pool.query(
      'DELETE FROM seo_fixes WHERE scan_id = $1',
      [scanId]
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} old fixes\n`);

    // Reapply fixes with new code
    console.log('2. Applying new fixes...');
    const response = await axios.post(
      'http://localhost:3001/api/seo/apply-all-fixes',
      {
        userId: userId,
        scanId: scanId
      }
    );

    if (response.data.success) {
      console.log(`✅ Applied ${response.data.appliedCount} new fixes\n`);
      console.log('3. New fixes are now using intelligent title shortening!\n');
      console.log('✅ Done! Refresh your browser to see the new changes.\n');
    } else {
      console.log('❌ Failed to apply fixes:', response.data);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

regenerateFixes();
