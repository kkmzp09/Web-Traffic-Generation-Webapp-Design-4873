@echo off
echo ========================================
echo   Final Setup - Free Scan API
echo ========================================
echo.
echo Step 1: Uploading corrected free-scan-api.js...
scp server-files\free-scan-api.js root@67.217.60.57:/root/relay/server-files/
echo.
echo Step 2: Adding route to server.js...
ssh root@67.217.60.57 "cd /root/relay && cp server.js server.js.backup-final && sed -i '/const keywordTrackerAPI = require/a const freeScanAPI = require('"'"'./server-files/free-scan-api'"'"');' server.js && sed -i '/app.use.*keyword-tracker-api/a app.use('"'"'/api/seo'"'"', freeScanAPI);\nconsole.log('"'"'✅ Free Scan API routes initialized'"'"');' server.js"
echo.
echo Step 3: Restarting relay-api...
ssh root@67.217.60.57 "pm2 restart relay-api && sleep 2 && pm2 logs relay-api --lines 20"
pause
