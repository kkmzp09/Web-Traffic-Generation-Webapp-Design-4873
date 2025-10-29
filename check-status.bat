@echo off
echo Checking PM2 logs for errors...
ssh root@67.217.60.57 "pm2 logs relay-api --lines 50 --nostream | grep -i 'keyword\|error\|initialized'"
pause
