@echo off
echo ========================================
echo Adding DataForSEO Routes Automatically
echo ========================================
echo.

ssh root@67.217.60.57 "chmod +x /root/relay/auto-add-routes.sh"
ssh root@67.217.60.57 "/root/relay/auto-add-routes.sh"

echo.
echo ========================================
echo Done! Testing API...
echo ========================================
echo.

timeout /t 3 /nobreak >nul

curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
pause
