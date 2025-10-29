@echo off
echo Waiting for API to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing locations endpoint...
curl https://api.organitrafficboost.com/api/seo/locations

echo.
echo.
echo Checking PM2 logs...
ssh root@67.217.60.57 "pm2 logs relay-api --lines 20 --nostream"

pause
