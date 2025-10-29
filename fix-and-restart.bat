@echo off
echo Uploading fix...
scp fix-server.sh root@67.217.60.57:/root/relay/

echo.
echo Running fix...
ssh root@67.217.60.57 "bash /root/relay/fix-server.sh"

echo.
echo Waiting for API...
timeout /t 5 /nobreak >nul

echo.
echo Testing...
curl https://api.organitrafficboost.com/api/seo/locations

pause
