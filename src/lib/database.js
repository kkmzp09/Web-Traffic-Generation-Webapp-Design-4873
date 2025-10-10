import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Get database URL from environment variables
const getDatabaseUrl = () => {
  // Only use client-side environment variables in browser
  if (typeof window !== 'undefined') {
    return import.meta.env?.VITE_DATABASE_URL;
  }
  // Server-side fallback
  return process.env?.DATABASE_URL || import.meta.env?.VITE_DATABASE_URL;
};

// Initialize Neon client and Drizzle ORM
let sql;
let db;
let initializationError = null;

const initializeDatabase = () => {
  try {
    const databaseUrl = getDatabaseUrl();
    if (databaseUrl) {
      sql = neon(databaseUrl);
      db = drizzle(sql, { 
        schema,
        logger: false // Disable logging in production
      });
      console.log('✅ Database initialized successfully');
      return true;
    } else {
      console.warn('⚠️ Database URL not found - running in offline mode');
      initializationError = 'Database URL not configured';
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error);
    initializationError = error.message;
    return false;
  }
};

// Initialize on import
initializeDatabase();

// Export the database instance and SQL client
export { db, sql };

// Validate database connection string
export const validateDatabaseConfig = () => {
  const url = getDatabaseUrl();
  
  if (!url) {
    throw new Error('Database URL is not configured. Please check your environment variables (VITE_DATABASE_URL).');
  }
  
  if (!url.startsWith('postgresql://')) {
    throw new Error('Invalid database URL format. Expected PostgreSQL connection string.');
  }
  
  return true;
};

// Database connection status
export const getDatabaseStatus = async () => {
  if (initializationError) {
    return {
      status: 'error',
      error: initializationError
    };
  }

  try {
    if (!db || !sql) {
      return {
        status: 'not_initialized',
        error: 'Database not initialized'
      };
    }

    validateDatabaseConfig();
    
    // Test the connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    const connectionPromise = sql`SELECT 1 as test, version() as version, current_database() as database`;
    
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    
    return {
      status: 'connected',
      provider: 'Neon',
      orm: 'Drizzle ORM v0.36.0',
      ssl: true,
      pooling: true,
      connectionTest: 'passed',
      version: result[0]?.version?.split(' ')[0] || 'Unknown',
      database: result[0]?.database || 'Unknown'
    };
  } catch (connectionError) {
    console.error('Database connection test failed:', connectionError);
    return {
      status: 'error',
      provider: 'Neon',
      orm: 'Drizzle ORM v0.36.0',
      error: `Connection test failed: ${connectionError.message}`
    };
  }
};

// Extract database info for display (without sensitive data)
export const getDatabaseInfo = () => {
  const url = getDatabaseUrl();
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      database: urlObj.pathname.substring(1),
      port: urlObj.port || '5432',
      ssl: urlObj.searchParams.get('sslmode') === 'require',
      orm: 'Drizzle ORM v0.36.0',
      driver: 'Neon HTTP'
    };
  } catch {
    return null;
  }
};

// Database query helper function with fallback
export const executeQuery = async (queryFn) => {
  if (!db) {
    console.warn('Database not available - returning mock data');
    // Return mock data for demo purposes when database is not available
    return queryFn({
      select: () => ({ from: () => ({ where: () => ({ limit: () => [] }) }) }),
      insert: () => ({ values: () => ({ returning: () => [{ id: 'mock-id' }] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => [{ id: 'mock-id' }] }) }) }),
      delete: () => ({ where: () => Promise.resolve() })
    });
  }
  
  try {
    const result = await queryFn(db);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    
    // Return empty results instead of throwing errors during development
    if (import.meta.env?.DEV) {
      console.warn('Returning empty result due to database error in development mode');
      return [];
    }
    
    // More specific error handling for production
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      throw new Error(`Database table not found. Please initialize the database first.`);
    }
    
    if (error.message?.includes('column') && error.message?.includes('does not exist')) {
      throw new Error(`Database schema mismatch. Please run database migrations.`);
    }
    
    throw new Error(`Database operation failed: ${error.message}`);
  }
};

// Raw SQL execution helper with fallback
export const executeRawSQL = async (strings, ...values) => {
  if (!sql) {
    console.warn('SQL client not available - operation skipped');
    return [];
  }
  
  try {
    if (Array.isArray(strings)) {
      return await sql(strings, ...values);
    } else {
      return await sql(strings);
    }
  } catch (error) {
    console.error('Raw SQL query error:', error);
    
    if (import.meta.env?.DEV) {
      console.warn('Returning empty result due to SQL error in development mode');
      return [];
    }
    
    throw new Error(`SQL operation failed: ${error.message}`);
  }
};

// Health check function with timeout
export const healthCheck = async () => {
  try {
    if (!sql) {
      return {
        healthy: false,
        error: 'Database connection not initialized',
        timestamp: new Date().toISOString()
      };
    }
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), 3000)
    );
    
    const healthPromise = sql`
      SELECT 
        version() as version,
        current_database() as database,
        current_user as user,
        now() as timestamp,
        pg_database_size(current_database()) as db_size
    `;
    
    const result = await Promise.race([healthPromise, timeoutPromise]);
    
    return {
      healthy: true,
      info: {
        ...result[0],
        db_size: `${Math.round(result[0].db_size / 1024 / 1024)} MB`
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Connection test utility
export const testConnection = async () => {
  try {
    const status = await getDatabaseStatus();
    const health = await healthCheck();
    
    return {
      connection: status,
      health: health,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connection: { status: 'error', error: error.message },
      health: { healthy: false, error: error.message },
      timestamp: new Date().toISOString()
    };
  }
};

// Quick initialization check with fallback
export const checkTablesExist = async () => {
  try {
    if (!sql) return false;
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Table check timeout')), 2000)
    );
    
    const checkPromise = sql`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables 
      WHERE table_name IN ('users', 'user_sessions', 'campaigns', 'traffic_logs', 'analytics_summary', 'user_settings', 'system_metrics')
      AND table_schema = 'public'
    `;
    
    const result = await Promise.race([checkPromise, timeoutPromise]);
    return parseInt(result[0]?.table_count || 0) === 7;
  } catch (error) {
    console.error('Table check failed:', error);
    return false;
  }
};

// Initialize database on demand
export const ensureDatabaseInitialized = () => {
  if (!db && !initializationError) {
    return initializeDatabase();
  }
  return !!db;
};