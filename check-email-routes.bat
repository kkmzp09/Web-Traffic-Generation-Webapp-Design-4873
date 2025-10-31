@echo off
echo Checking email-api routes...
ssh root@67.217.60.57 "ls -la /root/email-api/ && echo '---' && grep -n 'password-reset' /root/email-api/*.js"
pause
