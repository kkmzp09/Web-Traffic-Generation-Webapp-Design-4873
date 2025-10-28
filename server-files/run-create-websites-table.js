// Create user_websites table in Neon database
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createWebsitesTable() {
  try {
    console.log('📊 Creating user_websites table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_websites (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        domain VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        widget_status VARCHAR(50) DEFAULT 'not_connected',
        last_widget_check TIMESTAMP,
        last_scan_date TIMESTAMP,
        total_scans INTEGER DEFAULT 0,
        avg_seo_score INTEGER DEFAULT 0,
        critical_issues INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, domain)
      )
    `);

    console.log('✅ Table created successfully!');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_websites_user_id ON user_websites(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_websites_domain ON user_websites(domain)
    `);

    console.log('✅ Indexes created successfully!');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createWebsitesTable();
