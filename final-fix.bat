@echo off
scp proper-fix.sh root@67.217.60.57:/root/relay/
ssh root@67.217.60.57 "bash /root/relay/proper-fix.sh"
timeout /t 5 /nobreak >nul
curl https://api.organitrafficboost.com/api/seo/locations
pause
