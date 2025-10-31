@echo off
echo Updating server.js and restarting API...
echo.
echo You will be prompted for your VPS password
echo.
ssh root@165.232.177.47 "cd /root/traffic-app && if ! grep -q 'free-scan-api' server.js; then sed -i '/keyword-tracker-api/a const freeScanAPI = require('"'"'./server-files/free-scan-api'"'"');\napp.use('"'"'/api/seo'"'"', freeScanAPI);' server.js && echo 'Route added'; else echo 'Route already exists'; fi && pm2 restart traffic-api && pm2 logs traffic-api --lines 20"
echo.
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Test at: https://organitrafficboost.com
echo.
pause
