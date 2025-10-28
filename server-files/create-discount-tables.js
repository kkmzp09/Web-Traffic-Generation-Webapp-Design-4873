// Create discount codes and usage tracking tables
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createDiscountTables() {
  try {
    console.log('📊 Creating discount tables...');

    // Create discount_codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discount_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value DECIMAL(10,2) NOT NULL,
        applicable_plans TEXT[],
        max_uses INTEGER,
        uses INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ discount_codes table created');

    // Create discount_usage table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discount_usage (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        discount_code VARCHAR(50) NOT NULL,
        plan_type VARCHAR(50),
        amount_saved DECIMAL(10,2),
        used_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ discount_usage table created');

    // Add missing columns if they don't exist
    await pool.query(`
      ALTER TABLE discount_codes 
      ADD COLUMN IF NOT EXISTS applicable_plans TEXT[]
    `);

    await pool.query(`
      ALTER TABLE discount_codes 
      ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP
    `);

    console.log('✅ Columns updated');

    // Insert some default discount codes
    await pool.query(`
      INSERT INTO discount_codes (code, description, discount_type, discount_value, applicable_plans, max_uses)
      VALUES 
        ('FREE100', '100% off first month', 'percentage', 100, ARRAY['seo_professional', 'seo_business'], NULL),
        ('SAVE20', '20% off any plan', 'percentage', 20, NULL, NULL),
        ('SAVE50', '$50 off Professional or Business', 'fixed', 50, ARRAY['seo_professional', 'seo_business'], NULL)
      ON CONFLICT (code) DO NOTHING
    `);

    console.log('✅ Default discount codes inserted');
    console.log('\n📋 Available discount codes:');
    console.log('  - FREE100: 100% off first month (Professional/Business)');
    console.log('  - SAVE20: 20% off any plan');
    console.log('  - SAVE50: $50 off Professional/Business');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createDiscountTables();
