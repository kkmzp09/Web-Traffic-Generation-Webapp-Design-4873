@echo off
echo Checking auth-api endpoints...
ssh root@67.217.60.57 "ls -la /root/auth-api/ && echo '---' && grep -n 'forgot-password\|reset-password' /root/auth-api/*.js"
pause
