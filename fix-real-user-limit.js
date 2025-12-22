// Fix the ACTUAL logged-in user's subscription limit
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixRealUserLimit() {
  try {
    console.log('🔍 Finding your actual user account...\n');
    
    // Find recent scans to identify the real user
    const recentScans = await pool.query(
      `SELECT DISTINCT user_id, COUNT(*) as scan_count 
       FROM seo_scans 
       WHERE created_at > NOW() - INTERVAL '24 hours'
       GROUP BY user_id 
       ORDER BY scan_count DESC`
    );
    
    console.log('Recent users who ran scans:');
    recentScans.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. User ID: ${row.user_id} (${row.scan_count} scans)`);
    });
    
    if (recentScans.rows.length === 0) {
      console.log('\n❌ No recent scans found');
      process.exit(1);
    }
    
    // Use the most active user
    const realUserId = recentScans.rows[0].user_id;
    console.log(`\n✅ Using User ID: ${realUserId}\n`);
    
    // Check current subscription
    const currentSub = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [realUserId, 'active']
    );
    
    if (currentSub.rows.length > 0) {
      console.log('Current Subscription:');
      console.log(`  Plan: ${currentSub.rows[0].plan_type}`);
      console.log(`  Page Limit: ${currentSub.rows[0].seo_page_limit}`);
      console.log(`  Status: ${currentSub.rows[0].status}\n`);
      
      // Update to 500 pages
      await pool.query(
        `UPDATE subscriptions 
         SET seo_page_limit = 500,
             plan_type = 'seo_professional'
         WHERE user_id = $1 AND status = 'active'`,
        [realUserId]
      );
      console.log('✅ Updated to 500 pages/month');
    } else {
      // Create new subscription
      await pool.query(
        `INSERT INTO subscriptions 
         (user_id, plan_type, status, seo_page_limit, seo_scans_per_month, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [realUserId, 'seo_professional', 'active', 500, 100]
      );
      console.log('✅ Created subscription with 500 pages/month');
    }
    
    // Clear monitoring records
    const deleted = await pool.query(
      `DELETE FROM seo_monitoring 
       WHERE user_id = $1 
       AND measured_at >= date_trunc('month', CURRENT_DATE)`,
      [realUserId]
    );
    console.log(`✅ Cleared ${deleted.rowCount} monitoring records\n`);
    
    // Verify
    const newSub = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [realUserId, 'active']
    );
    
    console.log('📊 New Subscription:');
    console.log(`  User ID: ${realUserId}`);
    console.log(`  Plan: ${newSub.rows[0].plan_type}`);
    console.log(`  Page Limit: ${newSub.rows[0].seo_page_limit} pages/month`);
    console.log(`  Scans Limit: ${newSub.rows[0].seo_scans_per_month} scans/month`);
    console.log(`  Status: ${newSub.rows[0].status}\n`);
    
    console.log('✅ DONE! Refresh your dashboard to see 500-page limit\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixRealUserLimit();
