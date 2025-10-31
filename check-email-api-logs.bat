@echo off
echo Checking email-api logs...
ssh root@67.217.60.57 "pm2 logs email-api --lines 50 --nostream"
pause
