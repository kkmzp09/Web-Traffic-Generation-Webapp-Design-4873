@echo off
echo Checking PM2 error logs...
ssh root@67.217.60.57 "pm2 logs relay-api --err --lines 30 --nostream"
pause
