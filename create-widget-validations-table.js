// Create widget_validations table
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  try {
    console.log('\n📦 Creating widget_validations table...\n');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS widget_validations (
        id SERIAL PRIMARY KEY,
        domain VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        validated BOOLEAN DEFAULT false,
        script_tag TEXT,
        validated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(domain, user_id)
      )
    `);
    
    console.log('✅ Table created successfully\n');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_widget_validations_domain 
      ON widget_validations(domain)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_widget_validations_user 
      ON widget_validations(user_id)
    `);
    
    console.log('✅ Indexes created successfully\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();
