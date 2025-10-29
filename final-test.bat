@echo off
echo Waiting for API to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing DataForSEO On-Page API...
curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
echo If you see a scanId, it's working!
pause
