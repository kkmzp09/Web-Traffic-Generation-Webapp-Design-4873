@echo off
echo Adding routes at exact location...
ssh root@67.217.60.57 "chmod +x /root/relay/add-routes-exact.sh"
ssh root@67.217.60.57 "bash /root/relay/add-routes-exact.sh"

echo.
echo Testing API...
timeout /t 3 /nobreak >nul
curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\"}"

pause
