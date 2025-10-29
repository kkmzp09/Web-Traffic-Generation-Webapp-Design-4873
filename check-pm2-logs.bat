@echo off
echo Checking PM2 logs for errors...
ssh root@67.217.60.57 "pm2 logs relay-api --lines 30 --nostream | grep -A 5 -B 5 -i 'checkout\|error'"
pause
