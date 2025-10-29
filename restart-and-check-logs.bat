@echo off
echo Restarting API...
ssh root@67.217.60.57 "pm2 restart relay-api && sleep 2 && pm2 logs relay-api --lines 50 --nostream"
pause
