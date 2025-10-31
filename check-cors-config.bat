@echo off
echo Checking CORS configuration...
ssh root@67.217.60.57 "grep -n 'cors\|origin' /var/www/auth-api/server-auth.js | head -20"
pause
