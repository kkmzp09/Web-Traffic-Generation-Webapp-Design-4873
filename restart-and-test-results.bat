@echo off
echo Restarting API with optimized results...
ssh root@67.217.60.57 "pm2 restart relay-api"

echo.
echo Waiting for API to start...
timeout /t 3 /nobreak >nul

echo.
echo Testing results endpoint for scan 98...
curl https://api.organitrafficboost.com/api/dataforseo/onpage/results/98

echo.
echo.
pause
