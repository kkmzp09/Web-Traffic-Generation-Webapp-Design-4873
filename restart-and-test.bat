@echo off
echo Restarting API...
ssh root@67.217.60.57 "pm2 restart relay-api"

echo.
echo Testing fixed API...
timeout /t 2 /nobreak >nul

curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
pause
