@echo off
echo =========================================
echo   Free Scan Backend Setup
echo =========================================
echo.
echo This will:
echo 1. Upload free-scan-api.js to your VPS
echo 2. Upload and run setup script
echo 3. Restart the API server
echo.
echo You will be prompted for your VPS password 2-3 times
echo.
pause

echo.
echo Step 1: Uploading free-scan-api.js...
scp server-files/free-scan-api.js root@165.232.177.47:/root/traffic-app/server-files/

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to upload free-scan-api.js
    pause
    exit /b 1
)

echo ✓ Uploaded free-scan-api.js
echo.

echo Step 2: Uploading setup script...
scp setup-backend.sh root@165.232.177.47:/root/

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to upload setup script
    pause
    exit /b 1
)

echo ✓ Uploaded setup script
echo.

echo Step 3: Running setup script on VPS...
ssh root@165.232.177.47 "chmod +x /root/setup-backend.sh && bash /root/setup-backend.sh"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Setup script failed
    pause
    exit /b 1
)

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo Backend API is ready at:
echo https://api.organitrafficboost.com/api/seo/free-scan
echo.
echo Frontend is live at:
echo https://organitrafficboost.com
echo.
echo Test the free scan feature on your homepage!
echo.
pause
