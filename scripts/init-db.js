import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const connectionTest = await sql`SELECT version(), current_database()`;
    console.log('✅ Database connection successful');
    console.log(`📊 Database: ${connectionTest[0].current_database}`);
    console.log(`🔧 Version: ${connectionTest[0].version.split(' ')[0]}`);

    // Create tables in correct order (considering foreign key dependencies)
    console.log('\n📋 Creating database tables...');

    // 1. Users table
    console.log('👤 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        profile_picture TEXT,
        phone_number VARCHAR(20),
        timezone VARCHAR(50) DEFAULT 'UTC',
        language VARCHAR(10) DEFAULT 'en',
        two_factor_enabled BOOLEAN DEFAULT false,
        last_password_change TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. User sessions table
    console.log('🔐 Creating user_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        session_token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. Campaigns table
    console.log('📈 Creating campaigns table...');
    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(255) NOT NULL,
        target_url TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'inactive',
        traffic_rate INTEGER NOT NULL DEFAULT 30,
        total_requests INTEGER DEFAULT 0,
        successful_requests INTEGER DEFAULT 0,
        failed_requests INTEGER DEFAULT 0,
        user_agent TEXT DEFAULT 'TrafficGen Bot 1.0',
        countries TEXT DEFAULT '["US","UK","DE","FR","CA"]',
        respect_robots BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        started_at TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    // 4. Traffic logs table
    console.log('📊 Creating traffic_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS traffic_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
        request_url TEXT NOT NULL,
        status_code INTEGER,
        response_time INTEGER,
        user_agent TEXT,
        ip_address VARCHAR(45),
        country VARCHAR(2),
        success BOOLEAN NOT NULL,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `;

    // 5. Analytics summary table
    console.log('📈 Creating analytics_summary table...');
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_summary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date TIMESTAMP NOT NULL,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        total_requests INTEGER DEFAULT 0,
        successful_requests INTEGER DEFAULT 0,
        failed_requests INTEGER DEFAULT 0,
        avg_response_time DECIMAL(10,2),
        unique_countries INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 6. User settings table
    console.log('⚙️ Creating user_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
        default_traffic_rate INTEGER DEFAULT 30,
        max_concurrent_campaigns INTEGER DEFAULT 10,
        auto_stop_on_limit BOOLEAN DEFAULT true,
        respect_robots BOOLEAN DEFAULT true,
        default_user_agent TEXT DEFAULT 'TrafficGen Bot 1.0',
        default_countries TEXT DEFAULT '["US","UK","DE","FR","CA"]',
        email_alerts BOOLEAN DEFAULT true,
        campaign_updates BOOLEAN DEFAULT true,
        weekly_reports BOOLEAN DEFAULT false,
        error_alerts BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 7. System metrics table
    console.log('📊 Creating system_metrics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,2) NOT NULL,
        metric_unit VARCHAR(50),
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata TEXT
      )
    `;

    // Create indexes
    console.log('🔍 Creating database indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_traffic_logs_campaign_id ON traffic_logs(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_traffic_logs_timestamp ON traffic_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date);
      CREATE INDEX IF NOT EXISTS idx_analytics_summary_campaign_id ON analytics_summary(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
      CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
      CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
    `;

    // Insert initial system metrics
    console.log('📊 Setting up initial system data...');
    await sql`
      INSERT INTO system_metrics (metric_name, metric_value, metric_unit, metadata)
      VALUES 
        ('database_initialized', 1, 'boolean', '{"initialized_at": "' || NOW() || '", "version": "1.0", "simple_auth": true}'),
        ('total_users', 0, 'count', '{"description": "Total registered users"}'),
        ('total_campaigns', 0, 'count', '{"description": "Total campaigns created"}')
      ON CONFLICT (metric_name) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        timestamp = NOW(),
        metadata = EXCLUDED.metadata
    `;

    // Verify tables and data
    console.log('\n🔍 Verifying database setup...');
    
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_sessions', 'campaigns', 'traffic_logs', 'analytics_summary', 'user_settings', 'system_metrics')
      ORDER BY table_name
    `;

    console.log(`✅ Created ${tableCheck.length}/7 tables:`);
    tableCheck.forEach(table => {
      console.log(`   ✓ ${table.table_name}`);
    });

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('🚀 You can now start your application with: npm run dev');
    console.log('\n📝 Simple authentication system ready:');
    console.log('   • User registration and login');
    console.log('   • Session management');
    console.log('   • Campaign management');
    console.log('   • Analytics tracking');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

initializeDatabase();