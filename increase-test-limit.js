// Increase MONTHLY subscription limit to 500 pages for testing
// NOTE: This is the MONTHLY limit, NOT per-scan limit
// Per-scan limit stays at 10 pages
// With 500 monthly limit, you can run 50 scans (500 ÷ 10 = 50 scans/month)

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function increaseLimit() {
  try {
    const userId = '00000000-0000-0000-0000-000000000000';
    
    console.log('🔧 Increasing MONTHLY subscription limit to 500 pages...\n');
    console.log('📋 Note:');
    console.log('   - Monthly limit: 500 pages');
    console.log('   - Per-scan limit: 10 pages (unchanged)');
    console.log('   - Total scans allowed: 50 scans/month\n');
    
    // Check if subscription exists
    const checkSub = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );
    
    if (checkSub.rows.length > 0) {
      // Update existing subscription
      await pool.query(
        `UPDATE subscriptions 
         SET seo_page_limit = 500,
             plan_type = 'seo_professional'
         WHERE user_id = $1 AND status = 'active'`,
        [userId]
      );
      console.log('✅ Updated existing subscription');
    } else {
      // Create new subscription
      await pool.query(
        `INSERT INTO subscriptions 
         (user_id, plan_type, status, seo_page_limit, seo_scans_per_month, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, 'seo_professional', 'active', 500, 100]
      );
      console.log('✅ Created new subscription');
    }
    
    // Clear monitoring records to reset monthly usage
    const deleted = await pool.query(
      `DELETE FROM seo_monitoring 
       WHERE user_id = $1 
       AND measured_at >= date_trunc('month', CURRENT_DATE)`,
      [userId]
    );
    
    console.log(`✅ Cleared ${deleted.rowCount} monitoring records\n`);
    
    // Verify
    const verify = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );
    
    if (verify.rows.length > 0) {
      const sub = verify.rows[0];
      console.log('📊 Current Subscription:');
      console.log(`   Plan: ${sub.plan_type}`);
      console.log(`   Page Limit: ${sub.seo_page_limit} pages/month`);
      console.log(`   Scans Limit: ${sub.seo_scans_per_month} scans/month`);
      console.log(`   Status: ${sub.status}\n`);
    }
    
    console.log('✅ You can now scan up to 500 pages per month!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

increaseLimit();
