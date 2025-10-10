import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

// Get database URL from environment variables (works in both Node.js and browser)
const getDatabaseUrl = () => {
  // Try different environment variable sources
  if (typeof process !== 'undefined' && process.env) {
    return process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  }
  
  // Fallback for browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_DATABASE_URL;
  }
  
  return null;
};

const DATABASE_URL = getDatabaseUrl();

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please check your .env file contains DATABASE_URL or VITE_DATABASE_URL');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  console.log(`📍 Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown'}`);
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Verify schema after migration
export async function verifySchema() {
  console.log('🔍 Verifying database schema...');
  
  try {
    // Check if is_active column exists in user_sessions table
    const columnCheck = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      AND column_name = 'is_active'
    `;

    if (columnCheck.length > 0) {
      console.log('✅ is_active column found in user_sessions table');
      console.log(`   Type: ${columnCheck[0].data_type}`);
      console.log(`   Default: ${columnCheck[0].column_default}`);
      console.log(`   Nullable: ${columnCheck[0].is_nullable}`);
      return { success: true, column: columnCheck[0] };
    } else {
      console.log('❌ is_active column not found in user_sessions table');
      return { success: false, error: 'Column not found' };
    }
  } catch (error) {
    console.error('❌ Schema verification failed:', error);
    return { success: false, error: error.message };
  }
}

// Get full table schema for debugging
export async function getTableSchema(tableName = 'user_sessions') {
  try {
    const schema = await sql`
      SELECT column_name, data_type, column_default, is_nullable, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `;
    
    console.log(`📋 Schema for ${tableName}:`);
    schema.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}${
        col.character_maximum_length ? `(${col.character_maximum_length})` : ''
      }${col.column_default ? ` DEFAULT ${col.column_default}` : ''}${
        col.is_nullable === 'NO' ? ' NOT NULL' : ''
      }`);
    });
    
    return schema;
  } catch (error) {
    console.error(`❌ Failed to get schema for ${tableName}:`, error);
    return [];
  }
}

// Run the specific migration for is_active column
export async function runIsActiveMigration() {
  console.log('🔄 Running is_active column migration...');
  
  try {
    // Check if column already exists
    const columnExists = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      AND column_name = 'is_active'
    `;

    if (columnExists[0].count > 0) {
      console.log('✅ is_active column already exists');
      return { success: true, message: 'Column already exists' };
    }

    // Add the column
    await sql`
      ALTER TABLE user_sessions 
      ADD COLUMN is_active BOOLEAN DEFAULT true
    `;

    // Update existing records
    const updateResult = await sql`
      UPDATE user_sessions 
      SET is_active = true 
      WHERE is_active IS NULL
    `;

    console.log('✅ is_active column added successfully');
    console.log(`📊 Updated ${updateResult.count || 0} existing records`);
    
    return { 
      success: true, 
      message: 'Column added successfully',
      updatedRecords: updateResult.count || 0
    };
  } catch (error) {
    console.error('❌ is_active migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...');
    const result = await sql`SELECT 1 as test, version() as version, current_database() as database`;
    
    console.log('✅ Database connection successful');
    console.log(`   Database: ${result[0].database}`);
    console.log(`   Version: ${result[0].version.split(' ')[0]}`);
    
    return { 
      success: true, 
      database: result[0].database,
      version: result[0].version.split(' ')[0]
    };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error: error.message };
  }
}