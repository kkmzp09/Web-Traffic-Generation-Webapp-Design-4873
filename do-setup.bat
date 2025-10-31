@echo off
echo ========================================
echo   Backend Setup - Free Scan Feature
echo ========================================
echo.
echo Step 1: Creating directory...
ssh root@67.217.60.57 "mkdir -p /root/relay/server-files"
echo.
echo Step 2: Uploading free-scan-api.js...
scp server-files\free-scan-api.js root@67.217.60.57:/root/relay/server-files/
echo.
echo Step 3: Uploading dataforseo-onpage-service.js...
scp server-files\dataforseo-onpage-service.js root@67.217.60.57:/root/relay/server-files/
echo.
echo Step 4: Updating server.js...
ssh root@67.217.60.57 "cd /root/relay && cp server.js server.js.backup-freescan && echo 'import freeScanAPI from \"./server-files/free-scan-api.js\";' >> server.js.temp && cat server.js >> server.js.temp && mv server.js.temp server.js && sed -i '/app.use.*keyword-tracker-api/a app.use(\"/api/seo\", freeScanAPI);' server.js"
echo.
echo Step 5: Restarting server...
ssh root@67.217.60.57 "pm2 restart relay && pm2 logs relay --lines 30"
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
pause
