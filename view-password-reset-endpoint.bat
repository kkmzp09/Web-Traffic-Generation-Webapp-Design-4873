@echo off
echo Viewing password-reset endpoint...
ssh root@67.217.60.57 "sed -n '129,180p' /root/email-api/server.js"
pause
