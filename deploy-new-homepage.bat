@echo off
echo ========================================
echo   Deploying New Homepage & Free Scan
echo ========================================
echo.

echo Step 1: Upload backend API...
scp server-files/free-scan-api.js root@165.232.177.47:/root/traffic-app/server-files/

echo.
echo Step 2: Register API route in server.js...
echo Please manually add this line to server.js:
echo const freeScanAPI = require('./server-files/free-scan-api');
echo app.use('/api/seo', freeScanAPI);
echo.
pause

echo.
echo Step 3: Restart API server...
ssh root@165.232.177.47 "cd /root/traffic-app && pm2 restart traffic-api"

echo.
echo Step 4: Committing frontend changes...
git add -A
git commit -m "Add new homepage with free scan and redesigned layout"
git push origin dev

echo.
echo Step 5: Merging to main...
git checkout main
git merge dev
git push origin main
git checkout dev

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Frontend: https://organitrafficboost.com
echo Backend API: https://api.organitrafficboost.com/api/seo/free-scan
echo.
echo IMPORTANT: Configure SMTP settings in .env:
echo   SMTP_HOST=smtp.gmail.com
echo   SMTP_PORT=587
echo   SMTP_USER=your-email@gmail.com
echo   SMTP_PASS=your-app-password
echo.
pause
