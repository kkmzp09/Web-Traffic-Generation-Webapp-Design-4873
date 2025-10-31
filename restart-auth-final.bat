@echo off
echo Restarting auth-api with password reset endpoints...
ssh root@67.217.60.57 "pm2 restart auth-api && sleep 3 && pm2 logs auth-api --lines 20"
pause
