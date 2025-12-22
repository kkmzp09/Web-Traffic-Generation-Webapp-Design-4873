// Create verification table via Node.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  try {
    console.log('Creating autofix_verifications table...\n');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS autofix_verifications (
        id SERIAL PRIMARY KEY,
        scan_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        verified_at TIMESTAMP NOT NULL DEFAULT NOW(),
        changes_detected JSONB,
        change_count INTEGER DEFAULT 0,
        before_state JSONB,
        after_state JSONB,
        widget_logs JSONB,
        verification_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Table created successfully\n');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_autofix_verifications_scan_id 
      ON autofix_verifications(scan_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_autofix_verifications_url 
      ON autofix_verifications(url)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_autofix_verifications_status 
      ON autofix_verifications(verification_status)
    `);
    
    console.log('✅ Indexes created successfully\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();
