@echo off
echo Creating seo_scans table...
ssh root@67.217.60.57 "chmod +x /root/relay/create-table-and-test.sh"
ssh root@67.217.60.57 "bash /root/relay/create-table-and-test.sh"

echo.
echo Testing API...
timeout /t 2 /nobreak >nul

curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
pause
