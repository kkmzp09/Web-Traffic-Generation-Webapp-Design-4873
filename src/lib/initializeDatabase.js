import { executeRawSQL } from './database.js';

export const createDatabaseTables = async () => {
  const results = [];
  
  try {
    // Step 1: Create users table with all required columns
    results.push({ step: 'Creating users table', status: 'running' });
    
    await executeRawSQL`
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
    
    results[results.length - 1].status = 'success';

    // Step 2: Create user sessions table with proper columns
    results.push({ step: 'Creating user sessions table', status: 'running' });
    
    await executeRawSQL`
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
    
    results[results.length - 1].status = 'success';

    // Step 3: Create campaigns table
    results.push({ step: 'Creating campaigns table', status: 'running' });
    
    await executeRawSQL`
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
    
    results[results.length - 1].status = 'success';

    // Step 4: Create traffic logs table
    results.push({ step: 'Creating traffic logs table', status: 'running' });
    
    await executeRawSQL`
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
    
    results[results.length - 1].status = 'success';

    // Step 5: Create analytics summary table
    results.push({ step: 'Creating analytics summary table', status: 'running' });
    
    await executeRawSQL`
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
    
    results[results.length - 1].status = 'success';

    // Step 6: Create user settings table
    results.push({ step: 'Creating user settings table', status: 'running' });
    
    await executeRawSQL`
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
    
    results[results.length - 1].status = 'success';

    // Step 7: Create system metrics table
    results.push({ step: 'Creating system metrics table', status: 'running' });
    
    await executeRawSQL`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,2) NOT NULL,
        metric_unit VARCHAR(50),
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata TEXT
      )
    `;
    
    results[results.length - 1].status = 'success';

    // Step 8: Create indexes for better performance
    results.push({ step: 'Creating database indexes', status: 'running' });
    
    await executeRawSQL`
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
    
    results[results.length - 1].status = 'success';

    // Step 9: Insert initial system metrics
    results.push({ step: 'Setting up initial system data', status: 'running' });
    
    await executeRawSQL`
      INSERT INTO system_metrics (metric_name, metric_value, metric_unit, metadata)
      VALUES 
        ('database_initialized', 1, 'boolean', '{"initialized_at": "' || NOW() || '", "version": "1.0", "simple_auth": true}'),
        ('total_users', 0, 'count', '{"description": "Total registered users"}'),
        ('total_campaigns', 0, 'count', '{"description": "Total campaigns created"}')
      ON CONFLICT DO NOTHING
    `;
    
    results[results.length - 1].status = 'success';

    return {
      success: true,
      message: 'Database tables created successfully! You can now sign up and start using the application.',
      results
    };

  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Mark the last running step as failed
    const lastRunningIndex = results.findLastIndex(r => r.status === 'running');
    if (lastRunningIndex !== -1) {
      results[lastRunningIndex].status = 'error';
      results[lastRunningIndex].error = error.message;
    }
    
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

// Check if database is already initialized
export const checkDatabaseInitialization = async () => {
  try {
    const result = await executeRawSQL`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables 
      WHERE table_name IN ('users', 'user_sessions', 'campaigns', 'traffic_logs', 'analytics_summary', 'user_settings', 'system_metrics')
      AND table_schema = 'public'
    `;
    
    const tableCount = parseInt(result[0]?.table_count || 0);
    
    // Check if users table has all required columns
    if (tableCount >= 7) {
      try {
        const usersTableCheck = await executeRawSQL`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND table_schema = 'public'
          AND column_name IN ('id', 'email', 'password_hash', 'name', 'profile_picture', 'phone_number', 'timezone', 'language', 'two_factor_enabled', 'last_password_change')
        `;
        
        const sessionTableCheck = await executeRawSQL`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'user_sessions' 
          AND table_schema = 'public'
          AND column_name IN ('id', 'user_id', 'session_token', 'expires_at', 'ip_address', 'user_agent', 'is_active')
        `;
        
        const hasRequiredUsersColumns = usersTableCheck.length >= 10;
        const hasRequiredSessionColumns = sessionTableCheck.length >= 7;
        
        const missingUsersColumns = ['profile_picture', 'phone_number', 'timezone', 'language', 'two_factor_enabled', 'last_password_change'].filter(col => 
          !usersTableCheck.some(row => row.column_name === col)
        );
        
        const missingSessionColumns = ['ip_address', 'user_agent'].filter(col => 
          !sessionTableCheck.some(row => row.column_name === col)
        );
        
        return {
          isInitialized: hasRequiredUsersColumns && hasRequiredSessionColumns,
          tablesFound: tableCount,
          tablesExpected: 7,
          hasRequiredUsersColumns,
          hasRequiredSessionColumns,
          missingUsersColumns,
          missingSessionColumns
        };
      } catch (columnCheckError) {
        console.error('Column check error:', columnCheckError);
        return {
          isInitialized: false,
          tablesFound: tableCount,
          tablesExpected: 7,
          error: 'Unable to verify table structure'
        };
      }
    }
    
    return {
      isInitialized: tableCount === 7,
      tablesFound: tableCount,
      tablesExpected: 7
    };
  } catch (error) {
    console.error('Database initialization check error:', error);
    return {
      isInitialized: false,
      error: error.message,
      tablesFound: 0,
      tablesExpected: 7
    };
  }
};

// Force re-initialization (drops and recreates tables)
export const reinitializeDatabase = async () => {
  const results = [];
  
  try {
    results.push({ step: 'Dropping existing tables (if any)', status: 'running' });
    
    // Drop tables in reverse order due to foreign key constraints
    await executeRawSQL`
      DROP TABLE IF EXISTS system_metrics CASCADE;
      DROP TABLE IF EXISTS user_settings CASCADE;
      DROP TABLE IF EXISTS analytics_summary CASCADE;
      DROP TABLE IF EXISTS traffic_logs CASCADE;
      DROP TABLE IF EXISTS campaigns CASCADE;
      DROP TABLE IF EXISTS user_sessions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    
    results[results.length - 1].status = 'success';
    
    // Now create tables
    const createResult = await createDatabaseTables();
    
    return {
      success: createResult.success,
      message: createResult.success ? 
        'Database reinitialized successfully! All data has been reset.' : 
        'Failed to reinitialize database.',
      results: [...results, ...createResult.results],
      error: createResult.error
    };
    
  } catch (error) {
    console.error('Database reinitialization error:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

// Fix existing database schema (add missing columns) - IMPROVED VERSION
export const fixDatabaseSchema = async () => {
  const results = [];
  
  try {
    results.push({ step: 'Checking and fixing database schema', status: 'running' });
    
    // Fix users table - add missing columns one by one with error handling
    const usersColumns = [
      { name: 'profile_picture', type: 'TEXT', defaultValue: null },
      { name: 'phone_number', type: 'VARCHAR(20)', defaultValue: null },
      { name: 'timezone', type: 'VARCHAR(50)', defaultValue: "'UTC'" },
      { name: 'language', type: 'VARCHAR(10)', defaultValue: "'en'" },
      { name: 'two_factor_enabled', type: 'BOOLEAN', defaultValue: 'false' },
      { name: 'last_password_change', type: 'TIMESTAMP', defaultValue: 'NOW()' }
    ];

    for (const column of usersColumns) {
      try {
        // Check if column exists
        const columnCheck = await executeRawSQL`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND table_schema = 'public'
          AND column_name = ${column.name}
        `;

        if (columnCheck.length === 0) {
          results.push({ step: `Adding ${column.name} column to users table`, status: 'running' });
          
          // Build the ALTER TABLE command as a string to avoid template literal issues
          const alterCommand = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type}` + 
            (column.defaultValue ? ` DEFAULT ${column.defaultValue}` : '');
          
          await executeRawSQL(alterCommand);
          results[results.length - 1].status = 'success';
        } else {
          results.push({ step: `Column ${column.name} already exists in users table`, status: 'success' });
        }
      } catch (columnError) {
        console.error(`Error adding column ${column.name}:`, columnError);
        results.push({ 
          step: `Failed to add ${column.name} column`, 
          status: 'error', 
          error: columnError.message 
        });
      }
    }

    // Fix user_sessions table - add missing columns
    const sessionColumns = [
      { name: 'ip_address', type: 'VARCHAR(45)', defaultValue: null },
      { name: 'user_agent', type: 'TEXT', defaultValue: null }
    ];

    for (const column of sessionColumns) {
      try {
        // Check if column exists
        const columnCheck = await executeRawSQL`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'user_sessions' 
          AND table_schema = 'public'
          AND column_name = ${column.name}
        `;

        if (columnCheck.length === 0) {
          results.push({ step: `Adding ${column.name} column to user_sessions table`, status: 'running' });
          
          const alterCommand = `ALTER TABLE user_sessions ADD COLUMN ${column.name} ${column.type}`;
          await executeRawSQL(alterCommand);
          results[results.length - 1].status = 'success';
        } else {
          results.push({ step: `Column ${column.name} already exists in user_sessions table`, status: 'success' });
        }
      } catch (columnError) {
        console.error(`Error adding column ${column.name}:`, columnError);
        results.push({ 
          step: `Failed to add ${column.name} column`, 
          status: 'error', 
          error: columnError.message 
        });
      }
    }

    results[0].status = 'success';

    // Final verification
    results.push({ step: 'Verifying schema fix', status: 'running' });
    
    const finalCheck = await checkDatabaseInitialization();
    if (finalCheck.isInitialized) {
      results[results.length - 1].status = 'success';
      return {
        success: true,
        message: 'Database schema fixed successfully! All missing columns have been added.',
        results
      };
    } else {
      results[results.length - 1].status = 'error';
      results[results.length - 1].error = 'Some columns are still missing after fix attempt';
      return {
        success: false,
        message: 'Schema fix partially completed, but some issues remain.',
        results,
        remainingIssues: finalCheck
      };
    }

  } catch (error) {
    console.error('Database schema fix error:', error);
    
    // Mark the last running step as failed
    const lastRunningIndex = results.findLastIndex(r => r.status === 'running');
    if (lastRunningIndex !== -1) {
      results[lastRunningIndex].status = 'error';
      results[lastRunningIndex].error = error.message;
    }
    
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

// Alternative: Complete schema rebuild (safer for complex fixes)
export const rebuildUsersTableSchema = async () => {
  const results = [];
  
  try {
    results.push({ step: 'Creating backup of users table', status: 'running' });
    
    // Create a backup table with existing data
    await executeRawSQL`
      CREATE TEMP TABLE users_backup AS 
      SELECT id, email, password_hash, name, is_active, email_verified, last_login_at, created_at, updated_at
      FROM users
    `;
    
    results[results.length - 1].status = 'success';
    
    results.push({ step: 'Dropping and recreating users table', status: 'running' });
    
    // Drop and recreate users table with all columns
    await executeRawSQL`
      DROP TABLE users CASCADE;
      
      CREATE TABLE users (
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
    
    results[results.length - 1].status = 'success';
    
    results.push({ step: 'Restoring user data', status: 'running' });
    
    // Restore data from backup
    await executeRawSQL`
      INSERT INTO users (id, email, password_hash, name, is_active, email_verified, last_login_at, created_at, updated_at)
      SELECT id, email, password_hash, name, is_active, email_verified, last_login_at, created_at, updated_at
      FROM users_backup
    `;
    
    results[results.length - 1].status = 'success';
    
    results.push({ step: 'Recreating user_sessions table', status: 'running' });
    
    // Recreate user_sessions table with proper foreign key
    await executeRawSQL`
      DROP TABLE IF EXISTS user_sessions CASCADE;
      
      CREATE TABLE user_sessions (
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
    
    results[results.length - 1].status = 'success';
    
    results.push({ step: 'Recreating indexes', status: 'running' });
    
    // Recreate indexes
    await executeRawSQL`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
    `;
    
    results[results.length - 1].status = 'success';

    return {
      success: true,
      message: 'Users table schema rebuilt successfully! All missing columns have been added and existing data preserved.',
      results
    };

  } catch (error) {
    console.error('Users table rebuild error:', error);
    
    // Mark the last running step as failed
    const lastRunningIndex = results.findLastIndex(r => r.status === 'running');
    if (lastRunningIndex !== -1) {
      results[lastRunningIndex].status = 'error';
      results[lastRunningIndex].error = error.message;
    }
    
    return {
      success: false,
      error: error.message,
      results
    };
  }
};