@echo off
echo Restarting relay-api and checking logs...
ssh root@67.217.60.57 "pm2 restart relay-api && sleep 3 && pm2 logs relay-api --lines 30"
pause
