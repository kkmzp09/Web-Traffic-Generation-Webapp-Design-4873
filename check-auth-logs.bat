@echo off
echo Checking auth-api logs for errors...
ssh root@67.217.60.57 "pm2 logs auth-api --lines 30 --nostream | tail -40"
pause
