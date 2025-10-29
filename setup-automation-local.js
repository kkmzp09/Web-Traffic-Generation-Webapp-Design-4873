// Local setup script - runs all deployment steps
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const SERVER = 'root@67.217.60.57';

async function runCommand(description, command) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📋 ${description}`);
  console.log(`${'='.repeat(50)}`);
  
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ ${description} - Complete!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed!`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Starting Automated SEO System Deployment\n');

  // Step 1: Create database tables
  await runCommand(
    'Step 1: Creating Database Tables',
    `ssh ${SERVER} "cd /root/relay && node -e \\"require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); const sql = fs.readFileSync('create-monitoring-tables.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ Tables created'); pool.end(); }).catch(err => { console.error('❌ Error:', err.message); pool.end(); });\\"`
  );

  // Step 2: Setup cron jobs
  await runCommand(
    'Step 2: Setting Up Cron Jobs',
    `ssh ${SERVER} "cd /root/relay && chmod +x setup-automated-monitoring.sh && ./setup-automated-monitoring.sh"`
  );

  // Step 3: Test email (you'll need to add API keys first)
  console.log('\n📧 Next: Add API keys to .env file on server');
  console.log('   - DATAFORSEO_LOGIN');
  console.log('   - DATAFORSEO_PASSWORD');
  console.log('   - RESEND_API_KEY');

  console.log('\n🎉 Deployment Complete!\n');
}

main().catch(console.error);
