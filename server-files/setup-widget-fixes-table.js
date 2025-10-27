// Setup script to create widget_fixes table in Neon database
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupWidgetFixesTable() {
  console.log('🚀 Setting up widget_fixes table in Neon database...');
  
  try {
    // Create widget_fixes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS widget_fixes (
        id SERIAL PRIMARY KEY,
        site_id VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
        fix_type VARCHAR(100) NOT NULL,
        fix_data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      );
    `);
    console.log('✅ Table widget_fixes created');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_widget_fixes_site_id ON widget_fixes(site_id);
    `);
    console.log('✅ Index idx_widget_fixes_site_id created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_widget_fixes_domain ON widget_fixes(domain);
    `);
    console.log('✅ Index idx_widget_fixes_domain created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_widget_fixes_status ON widget_fixes(status);
    `);
    console.log('✅ Index idx_widget_fixes_status created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_widget_fixes_scan_id ON widget_fixes(scan_id);
    `);
    console.log('✅ Index idx_widget_fixes_scan_id created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_widget_fixes_site_status ON widget_fixes(site_id, status);
    `);
    console.log('✅ Index idx_widget_fixes_site_status created');

    // Verify table was created
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'widget_fixes'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✅ Widget fixes table setup complete!');
    console.log('🎉 Ready to use auto-fix system!');

  } catch (error) {
    console.error('❌ Error setting up table:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupWidgetFixesTable();
