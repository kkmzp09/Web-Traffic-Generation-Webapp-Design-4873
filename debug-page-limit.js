// Debug what getUserPageLimit returns
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getUserPageLimit(userId) {
  try {
    const result = await pool.query(
      `SELECT seo_page_limit 
       FROM subscriptions 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0 && result.rows[0].seo_page_limit) {
      return result.rows[0].seo_page_limit;
    }

    return 10; // Default for starter plan
  } catch (error) {
    console.error('Error getting page limit:', error);
    return 10;
  }
}

async function debug() {
  const testUserId = '00000000-0000-0000-0000-000000000000';
  const realUserId = '80983ba6-0297-4a46-8bfb-cedba44e6bc7';
  
  console.log('\n🔍 Debugging Page Limits\n');
  
  const testLimit = await getUserPageLimit(testUserId);
  const realLimit = await getUserPageLimit(realUserId);
  
  console.log(`Test User (${testUserId}):`);
  console.log(`  Page Limit: ${testLimit}\n`);
  
  console.log(`Real User (${realUserId}):`);
  console.log(`  Page Limit: ${realLimit}\n`);
  
  // Check subscriptions
  const subs = await pool.query(
    'SELECT user_id, plan_type, seo_page_limit, status FROM subscriptions WHERE status = $1',
    ['active']
  );
  
  console.log('All Active Subscriptions:');
  subs.rows.forEach(sub => {
    console.log(`  ${sub.user_id.substring(0, 8)}... - ${sub.plan_type} - ${sub.seo_page_limit} pages`);
  });
  
  process.exit(0);
}

debug();
