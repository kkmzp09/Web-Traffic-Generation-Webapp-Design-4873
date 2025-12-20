@echo off
echo ================================================
echo Checking VPS Server for Campaign: 1762420823354
echo VPS: 67.217.60.57
echo ================================================
echo.

echo [1/6] Checking PM2 processes status...
echo ================================================
ssh root@67.217.60.57 "pm2 status"
echo.

echo [2/6] Searching for campaign ID in relay-api logs...
echo ================================================
ssh root@67.217.60.57 "pm2 logs relay-api --lines 500 --nostream | grep -i '1762420823354' || echo 'No matches found for campaign ID'"
echo.

echo [3/6] Checking recent relay-api activity...
echo ================================================
ssh root@67.217.60.57 "pm2 logs relay-api --lines 100 --nostream"
echo.

echo [4/6] Searching for proxy usage (SmartProxy/3120)...
echo ================================================
ssh root@67.217.60.57 "pm2 logs --lines 500 --nostream | grep -i 'smartproxy\|3120\|proxy.*assign' || echo 'No proxy usage found'"
echo.

echo [5/6] Checking worker logs (Playwright)...
echo ================================================
ssh root@67.217.60.57 "pm2 logs worker --lines 100 --nostream 2>/dev/null || echo 'Worker process not running or no logs'"
echo.

echo [6/6] Checking campaign tracking database...
echo ================================================
ssh root@67.217.60.57 "psql $DATABASE_URL -c \"SELECT * FROM campaigns WHERE id = '1762420823354' OR job_id = '1762420823354' LIMIT 5;\" 2>/dev/null || echo 'Database query not available or table does not exist'"
echo.

echo ================================================
echo Check complete!
echo ================================================
echo.
echo To manually investigate:
echo   ssh root@67.217.60.57
echo   pm2 logs relay-api --lines 1000 ^| grep -i campaign
echo   pm2 logs --lines 1000 ^| grep -i proxy
echo.
pause
