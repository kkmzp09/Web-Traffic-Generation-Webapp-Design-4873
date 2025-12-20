// run-migration.js
// Run database migration for page scans table

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🔧 Running migration: add-page-scans.sql');
    
    const migration = `
      -- Table: seo_page_scans
      CREATE TABLE IF NOT EXISTS seo_page_scans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
        page_url TEXT NOT NULL,
        page_title TEXT,
        meta_description TEXT,
        h1_tags TEXT[],
        image_count INTEGER DEFAULT 0,
        images_without_alt INTEGER DEFAULT 0,
        has_canonical BOOLEAN DEFAULT false,
        is_noindex BOOLEAN DEFAULT false,
        issues JSONB NOT NULL DEFAULT '[]'::jsonb,
        scan_success BOOLEAN DEFAULT true,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_page_scans_scan_id ON seo_page_scans(scan_id);
      CREATE INDEX IF NOT EXISTS idx_page_scans_page_url ON seo_page_scans(page_url);
      CREATE INDEX IF NOT EXISTS idx_page_scans_created_at ON seo_page_scans(created_at DESC);
    `;
    
    await pool.query(migration);
    console.log('✅ Migration complete!');
    
    // Verify table exists
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'seo_page_scans'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table seo_page_scans created successfully');
    } else {
      console.log('❌ Table creation failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
