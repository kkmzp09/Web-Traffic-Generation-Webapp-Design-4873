// Generate site_id for existing websites that don't have one
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function generateMissingSiteIds() {
  try {
    console.log('📊 Generating site_id for existing websites...');

    // Get websites without site_id
    const result = await pool.query(`
      SELECT id, user_id, domain FROM user_websites 
      WHERE site_id IS NULL OR site_id = ''
    `);

    console.log(`Found ${result.rows.length} websites without site_id`);

    for (const website of result.rows) {
      const siteId = `site_${website.user_id.replace(/-/g, '')}_${website.domain.replace(/\./g, '_')}_${Date.now()}`;
      
      await pool.query(
        `UPDATE user_websites SET site_id = $1 WHERE id = $2`,
        [siteId, website.id]
      );
      
      console.log(`✅ Generated site_id for ${website.domain}: ${siteId}`);
    }

    console.log('✅ All site_ids generated!');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

generateMissingSiteIds();
