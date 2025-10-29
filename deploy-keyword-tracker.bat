@echo off
echo ========================================
echo   Deploying Keyword Tracker
echo ========================================
echo.

echo Step 1: Uploading files to server...
scp server-files/keyword-tracker-schema.sql root@67.217.60.57:/root/relay/
scp server-files/dataforseo-keywords-service.js root@67.217.60.57:/root/relay/
scp server-files/keyword-tracker-api.js root@67.217.60.57:/root/relay/
scp server-files/setup-keyword-tracker.sh root@67.217.60.57:/root/relay/

echo.
echo Step 2: Setting up database...
ssh root@67.217.60.57 "chmod +x /root/relay/setup-keyword-tracker.sh && bash /root/relay/setup-keyword-tracker.sh"

echo.
echo Step 3: Adding routes to server...
echo Please add these lines to /root/relay/server.js:
echo.
echo const keywordTrackerAPI = require('./keyword-tracker-api');
echo app.use('/api/seo', keywordTrackerAPI);
echo console.log('✅ Keyword Tracker routes initialized');
echo.

echo Step 4: Restarting API...
ssh root@67.217.60.57 "pm2 restart relay-api"

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Test the API:
echo curl https://api.organitrafficboost.com/api/seo/locations
echo.
pause
