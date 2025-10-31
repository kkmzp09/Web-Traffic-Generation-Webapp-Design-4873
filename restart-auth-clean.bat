@echo off
echo Restarting auth-api...
ssh root@67.217.60.57 "pm2 restart auth-api && sleep 2 && pm2 logs auth-api --lines 10 --nostream"
pause
