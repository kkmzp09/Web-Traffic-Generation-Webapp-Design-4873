@echo off
echo Checking recent email logs...
ssh root@67.217.60.57 "pm2 logs relay-api --lines 100 --nostream | grep -A 5 -B 5 'Free scan\|Email\|send-scan-email'"
pause
