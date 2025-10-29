@echo off
echo ========================================
echo Adding Scan Stats Columns to Database
echo ========================================
echo.

echo Uploading SQL file...
scp server-files/add-scan-stats-columns.sql root@67.217.60.57:/root/relay/

echo.
echo Running migration...
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); const sql = fs.readFileSync('add-scan-stats-columns.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ Columns added successfully'); pool.end(); }).catch(err => { console.error('❌ Error:', err); pool.end(); process.exit(1); });\""

echo.
echo ========================================
echo Migration Complete!
echo ========================================
pause
