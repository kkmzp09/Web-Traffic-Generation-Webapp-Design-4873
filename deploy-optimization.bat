@echo off
REM Simple deployment script for 1000 visitor optimization

set VPS_IP=67.217.60.57
set VPS_USER=root
set VPS_PASS=4@N7m4^&g

echo ===============================================================
echo DEPLOYING 1000 VISITOR OPTIMIZATION
echo ===============================================================
echo.

echo [1/5] Uploading VPS optimization script...
pscp -pw %VPS_PASS% optimize-vps-for-1000-visitors.sh %VPS_USER%@%VPS_IP%:/root/
plink -ssh %VPS_USER%@%VPS_IP% -pw %VPS_PASS% -batch "chmod +x /root/optimize-vps-for-1000-visitors.sh"
echo Done.
echo.

echo [2/5] Running VPS optimization...
plink -ssh %VPS_USER%@%VPS_IP% -pw %VPS_PASS% -batch "bash /root/optimize-vps-for-1000-visitors.sh"
echo Done.
echo.

echo [3/5] Backing up current playwright server...
plink -ssh %VPS_USER%@%VPS_IP% -pw %VPS_PASS% -batch "cp /root/relay/playwright-server.js /root/relay/playwright-server.js.backup"
echo Done.
echo.

echo [4/5] Uploading optimized playwright server...
pscp -pw %VPS_PASS% server-files\playwright-server-optimized-1000.js %VPS_USER%@%VPS_IP%:/root/relay/playwright-server.js
echo Done.
echo.

echo [5/5] Restarting PM2 processes...
plink -ssh %VPS_USER%@%VPS_IP% -pw %VPS_PASS% -batch "pm2 restart playwright-api"
timeout /t 3
plink -ssh %VPS_USER%@%VPS_IP% -pw %VPS_PASS% -batch "pm2 list"
echo Done.
echo.

echo ===============================================================
echo DEPLOYMENT COMPLETE!
echo ===============================================================
echo.
echo Your VPS is now optimized for 1000 visitor campaigns!
echo.
pause
