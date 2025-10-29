@echo off
echo Uploading clean script...
scp clean-server.sh root@67.217.60.57:/root/relay/

echo.
echo Cleaning server.js...
ssh root@67.217.60.57 "bash /root/relay/clean-server.sh"

echo.
echo Waiting...
timeout /t 5 /nobreak >nul

echo.
echo Testing if API works now...
curl https://api.organitrafficboost.com/api/dataforseo/onpage/status/98

pause
