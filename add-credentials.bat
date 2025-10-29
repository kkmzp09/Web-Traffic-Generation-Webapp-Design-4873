@echo off
echo ========================================
echo Adding DataForSEO Credentials
echo ========================================
echo.

ssh root@67.217.60.57 "chmod +x /root/relay/add-dataforseo-credentials.sh"
ssh root@67.217.60.57 "bash /root/relay/add-dataforseo-credentials.sh"

echo.
echo ========================================
echo Testing API with credentials...
echo ========================================
echo.

timeout /t 3 /nobreak >nul

curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
pause
