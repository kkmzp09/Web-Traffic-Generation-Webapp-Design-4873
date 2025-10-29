@echo off
echo ========================================
echo Creating Database Tables
echo ========================================
plink -batch root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); const sql = fs.readFileSync('create-monitoring-tables.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ All tables created successfully'); pool.end(); }).catch(err => { console.error('❌ Error:', err.message); pool.end(); process.exit(1); });\""
echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
