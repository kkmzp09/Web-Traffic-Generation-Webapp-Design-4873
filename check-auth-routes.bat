@echo off
echo Checking auth routes...
ssh root@67.217.60.57 "grep -n 'forgot-password\|reset-password' /var/www/auth-api/server-auth.js"
pause
