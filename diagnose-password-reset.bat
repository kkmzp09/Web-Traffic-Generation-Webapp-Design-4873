@echo off
echo === DIAGNOSING PASSWORD RESET ISSUE ===
echo.
echo 1. Checking if reset_token columns exist in users table...
ssh root@67.217.60.57 "cd /var/www/auth-api && node -e \"const { Pool } = require('pg'); require('dotenv').config(); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \\\"users\\\" AND column_name LIKE \\\"reset%\\\"').then(r => { console.log('Reset columns:', r.rows); pool.end(); }).catch(e => { console.error('Error:', e.message); pool.end(); });\""
echo.
echo 2. Checking if forgot-password endpoint exists...
ssh root@67.217.60.57 "grep -n 'forgot-password' /var/www/auth-api/server-auth.js | head -3"
echo.
echo 3. Testing endpoint directly...
curl -X POST https://api.organitrafficboost.com/api/auth/forgot-password -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\"}" 2>&1 | head -10
echo.
echo 4. Checking recent auth-api errors...
ssh root@67.217.60.57 "pm2 logs auth-api --nostream --lines 5 --err"
pause
