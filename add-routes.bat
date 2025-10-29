@echo off
echo Adding routes to server.js...
ssh root@67.217.60.57 "bash /root/relay/add-routes-manual.sh"
echo.
echo Testing API...
timeout /t 3 /nobreak >nul
curl https://api.organitrafficboost.com/api/seo/locations
pause
