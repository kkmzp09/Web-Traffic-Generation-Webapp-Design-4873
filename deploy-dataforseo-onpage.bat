@echo off
echo ========================================
echo Deploying DataForSEO On-Page Integration
echo ========================================
echo.

echo Step 1: Uploading server files...
scp server-files/dataforseo-onpage-service.js root@67.217.60.57:/root/relay/
scp server-files/dataforseo-onpage-api.js root@67.217.60.57:/root/relay/
scp server-files/add-dataforseo-columns.sql root@67.217.60.57:/root/relay/

echo.
echo Step 2: Running database migration...
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); (async () => { try { const sql = fs.readFileSync('add-dataforseo-columns.sql', 'utf8'); await pool.query(sql); console.log('✅ Database migration completed'); await pool.end(); } catch (error) { console.error('❌ Error:', error.message); await pool.end(); process.exit(1); } })();\""

echo.
echo Step 3: Building frontend...
call npm run build

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Add DataForSEO routes to server.js
echo 2. Restart API with: pm2 restart relay-api
echo 3. Test the On-Page SEO Analyzer
echo.
pause
