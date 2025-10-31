@echo off
echo Checking email-api configuration...
ssh root@67.217.60.57 "head -30 /root/email-api/server.js | grep -E 'FROM_EMAIL|COMPANY_NAME|SUPPORT_EMAIL'"
pause
