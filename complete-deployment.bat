@echo off
echo ========================================
echo Completing DataForSEO Deployment
echo ========================================
echo.

echo Step 1: Running database migration...
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); (async () => { try { const sql = fs.readFileSync('add-dataforseo-columns.sql', 'utf8'); await pool.query(sql); console.log('✅ Database migration completed'); await pool.end(); } catch (error) { console.error('❌ Error:', error.message); await pool.end(); } })();\""

echo.
echo Step 2: Adding routes to server.js...
ssh root@67.217.60.57 "chmod +x /root/relay/add-dataforseo-routes.sh && /root/relay/add-dataforseo-routes.sh"

echo.
echo Step 3: Restarting API...
ssh root@67.217.60.57 "pm2 restart relay-api"

echo.
echo Step 4: Checking logs...
ssh root@67.217.60.57 "pm2 logs relay-api --lines 20 --nostream"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Test the On-Page SEO Analyzer now!
echo.
pause
