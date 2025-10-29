@echo off
echo Adding routes manually via SSH...
ssh root@67.217.60.57 "bash /root/relay/add-routes-directly.sh"

echo.
echo.
echo Waiting for API to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing Keyword Tracker API...
curl https://api.organitrafficboost.com/api/seo/locations

echo.
echo.
pause
