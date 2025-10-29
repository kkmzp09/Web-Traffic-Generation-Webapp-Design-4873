@echo off
echo ========================================
echo Restarting API with Fixed Page Counting
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && pm2 restart relay-api"
echo.
echo ========================================
echo API Restarted Successfully!
echo ========================================
pause
