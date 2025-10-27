@echo off
echo ========================================
echo Deploying Widget Auto-Fix System
echo ========================================
echo.

echo Step 1: Creating database table...
psql %DATABASE_URL% -f server-files/create-widget-fixes-table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database table
    pause
    exit /b 1
)
echo Database table created successfully!
echo.

echo Step 2: Uploading backend files...
scp -o StrictHostKeyChecking=no server-files/widget-fixes-api.js root@67.217.60.57:/root/relay/
scp -o StrictHostKeyChecking=no server-files/seo-automation-api.js root@67.217.60.57:/root/relay/
scp -o StrictHostKeyChecking=no server-files/widget.js root@67.217.60.57:/root/relay/widget/
echo Backend files uploaded!
echo.

echo Step 3: Restarting API server...
ssh root@67.217.60.57 "pm2 restart relay-api"
echo API server restarted!
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Test widget validation
echo 2. Run a scan
echo 3. Click "Auto-Fix" buttons
echo 4. Check widget applies fixes
echo.
pause
