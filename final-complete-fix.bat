@echo off
echo Step 1: Clean server.js...
ssh root@67.217.60.57 "bash /root/relay/clean-server.sh"

timeout /t 3 /nobreak >nul

echo.
echo Step 2: Add routes properly...
ssh root@67.217.60.57 "bash /root/relay/add-routes-once.sh"

timeout /t 5 /nobreak >nul

echo.
echo Step 3: Test API...
curl https://api.organitrafficboost.com/api/seo/locations

pause
