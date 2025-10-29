@echo off
echo Restarting API...
ssh root@67.217.60.57 "pm2 restart relay-api"

echo.
echo Waiting for API to start...
timeout /t 3 /nobreak >nul

echo.
echo Testing DataForSEO On-Page API...
curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
pause
