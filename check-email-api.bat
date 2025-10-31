@echo off
echo Checking for email-api on VPS...
ssh root@67.217.60.57 "ls -la /root/ | grep email && pm2 list | grep email"
pause
