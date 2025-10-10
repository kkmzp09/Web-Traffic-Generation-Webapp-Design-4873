import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

config({ path: envPath });

// Verify environment variables are loaded
console.log('🔧 Environment Check:');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Loaded' : '❌ Missing'}`);
console.log(`   VITE_DATABASE_URL: ${process.env.VITE_DATABASE_URL ? '✅ Loaded' : '❌ Missing'}`);

if (!process.env.DATABASE_URL && !process.env.VITE_DATABASE_URL) {
  console.error('❌ No database URL found in environment variables');
  console.error('   Please check your .env file contains DATABASE_URL or VITE_DATABASE_URL');
  process.exit(1);
}

// Import migration functions
import { 
  testDatabaseConnection,
  runIsActiveMigration, 
  verifySchema, 
  getTableSchema,
  runMigrations
} from '../src/lib/migrate.js';

async function main() {
  console.log('🚀 Starting database migration process...\n');

  // Step 1: Test database connection
  const connectionTest = await testDatabaseConnection();
  if (!connectionTest.success) {
    console.error('❌ Database connection failed:', connectionTest.error);
    process.exit(1);
  }
  console.log('');

  // Step 2: Show current schema
  console.log('📋 Current user_sessions table schema:');
  const currentSchema = await getTableSchema('user_sessions');
  console.log('');

  // Step 3: Run the specific is_active migration
  console.log('🔄 Running is_active column migration...');
  const migrationResult = await runIsActiveMigration();
  
  if (!migrationResult.success) {
    console.error('❌ Migration failed:', migrationResult.error);
    
    // Try the full Drizzle migration as fallback
    console.log('🔄 Trying full Drizzle migration as fallback...');
    const drizzleMigration = await runMigrations();
    
    if (!drizzleMigration.success) {
      console.error('❌ Drizzle migration also failed:', drizzleMigration.error);
      process.exit(1);
    }
  }

  console.log('');

  // Step 4: Verify the fix
  const verificationResult = await verifySchema();
  
  if (!verificationResult.success) {
    console.error('❌ Schema verification failed:', verificationResult.error);
    process.exit(1);
  }

  console.log('');

  // Step 5: Show updated schema
  console.log('📋 Updated user_sessions table schema:');
  const updatedSchema = await getTableSchema('user_sessions');

  console.log('\n🎉 Database migration completed successfully!');
  console.log('✅ The is_active column has been added to user_sessions table');
  console.log('🚀 Your application should now work without the column error');
  
  // Show the exact SQL that was executed
  console.log('\n📝 SQL executed:');
  console.log('```sql');
  console.log('ALTER TABLE user_sessions ADD COLUMN is_active BOOLEAN DEFAULT true;');
  console.log('UPDATE user_sessions SET is_active = true WHERE is_active IS NULL;');
  console.log('```');
}

main().catch((error) => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});