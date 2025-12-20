@echo off
REM Simple VPS Campaign Check for Job ID: 1762494336711

set JOB_ID=1762494336711
set VPS_IP=67.217.60.57

echo ===============================================================
echo VPS CAMPAIGN ANALYSIS - Job ID: %JOB_ID%
echo ===============================================================
echo.

echo [1] Checking PM2 Status...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "pm2 status"
echo.

echo [2] Checking Campaign Logs...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "pm2 logs relay-api --lines 200 --nostream | grep -i '%JOB_ID%'"
echo.

echo [3] Checking Campaign Tracker File...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "if [ -f /root/relay/campaigns.json ]; then cat /root/relay/campaigns.json | grep -A 20 '%JOB_ID%'; else echo 'campaigns.json not found'; fi"
echo.

echo [4] Querying Results API...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "curl -s http://localhost:3001/results/%JOB_ID%"
echo.

echo [5] Querying Status API...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "curl -s http://localhost:3001/status/%JOB_ID%"
echo.

echo [6] Listing Recent Campaigns...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "curl -s http://localhost:3001/campaigns | head -50"
echo.

echo [7] Checking Playwright Server...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "pm2 list | grep playwright"
echo.

echo [8] Recent Errors...
echo ---------------------------------------------------------------
ssh root@%VPS_IP% "pm2 logs relay-api --lines 50 --nostream --err"
echo.

echo ===============================================================
echo Analysis Complete
echo ===============================================================
pause
