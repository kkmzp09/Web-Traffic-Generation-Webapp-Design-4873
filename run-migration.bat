@echo off
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); const sql = fs.readFileSync('add-scan-stats-columns.sql', 'utf8'); pool.query(sql).then(() => { console.log('Columns added'); pool.end(); }).catch(err => { console.error('Error:', err); pool.end(); });\""
pause
