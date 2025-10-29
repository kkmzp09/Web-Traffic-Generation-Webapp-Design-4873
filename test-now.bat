@echo off
echo Waiting for API...
timeout /t 5 /nobreak >nul

echo Testing...
curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
pause
