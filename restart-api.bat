@echo off
echo ========================================
echo Restarting API with Email Notifications
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && pm2 restart relay-api && pm2 logs relay-api --lines 20"
echo.
pause
