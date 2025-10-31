@echo off
setlocal enabledelayedexpansion

set PASSWORD=4@N7m4^&g
set IP=67.217.60.57

echo ========================================
echo   Complete Backend Setup
echo ========================================
echo.
echo Step 1: Creating directory...
echo %PASSWORD%| ssh root@%IP% "mkdir -p /root/relay/server-files"

echo.
echo Step 2: Uploading free-scan-api.js...
echo %PASSWORD%| scp server-files\free-scan-api.js root@%IP%:/root/relay/server-files/

echo.
echo Step 3: Uploading dataforseo-onpage-service.js...
echo %PASSWORD%| scp server-files\dataforseo-onpage-service.js root@%IP%:/root/relay/server-files/

echo.
echo Step 4: Updating server.js...
echo %PASSWORD%| ssh root@%IP% "cd /root/relay && cp server.js server.js.backup-freescan && sed -i '/keyword-tracker-api/a import freeScanAPI from '"'"'./server-files/free-scan-api.js'"'"';\napp.use('"'"'/api/seo'"'"', freeScanAPI);' server.js"

echo.
echo Step 5: Restarting server...
echo %PASSWORD%| ssh root@%IP% "pm2 restart relay"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Test at: https://organitrafficboost.com
echo.
pause
