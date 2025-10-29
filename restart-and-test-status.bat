@echo off
echo Restarting API...
ssh root@67.217.60.57 "pm2 restart relay-api"
timeout /t 3 /nobreak >nul

echo.
echo Testing status for scan 104...
curl https://api.organitrafficboost.com/api/dataforseo/onpage/status/104

echo.
echo.
pause
