@echo off
ssh root@67.217.60.57 "pm2 restart relay-api"
timeout /t 5 /nobreak >nul
curl https://api.organitrafficboost.com/api/dataforseo/onpage/results/98
pause
