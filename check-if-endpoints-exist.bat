@echo off
echo Checking if password reset endpoints exist...
ssh root@67.217.60.57 "grep -c 'forgot-password' /var/www/auth-api/server-auth.js && grep -c 'reset-password' /var/www/auth-api/server-auth.js"
pause
