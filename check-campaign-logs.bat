@echo off
echo ================================================
echo Checking Campaign Logs for Job ID: 1762420823354
echo ================================================
echo.

echo Connecting to VPS: 67.217.60.57
echo.

echo === OPTION 1: Check PM2 Logs for Campaign ===
ssh root@67.217.60.57 "pm2 logs relay-api --lines 200 --nostream | grep -i '1762420823354'"

echo.
echo === OPTION 2: Check All Recent Relay Logs ===
ssh root@67.217.60.57 "pm2 logs relay-api --lines 50 --nostream"

echo.
echo === OPTION 3: Check Worker Logs (Playwright) ===
ssh root@67.217.60.57 "pm2 logs worker --lines 50 --nostream 2>/dev/null || echo 'Worker not running'"

echo.
echo === OPTION 4: Check for Proxy Usage ===
ssh root@67.217.60.57 "pm2 logs --lines 200 --nostream | grep -i 'proxy\|smartproxy\|3120'"

echo.
echo ================================================
echo To see full logs, SSH into VPS and run:
echo   ssh root@67.217.60.57
echo   pm2 logs relay-api
echo ================================================
pause
