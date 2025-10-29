@echo off
echo Checking latest scan status...
echo.

REM Get the latest scan ID from database
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.on('connect', (client) => { client.query('SET search_path TO public'); }); (async () => { const result = await pool.query('SELECT id, url, status, dataforseo_task_id FROM seo_scans ORDER BY created_at DESC LIMIT 1'); console.log(JSON.stringify(result.rows[0], null, 2)); await pool.end(); })();\""

pause
