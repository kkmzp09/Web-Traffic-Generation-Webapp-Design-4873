@echo off
echo Checking if password reset endpoints are in the file...
ssh root@67.217.60.57 "grep -c 'forgot-password' /var/www/auth-api/server-auth.js"
echo.
echo Checking file size...
ssh root@67.217.60.57 "wc -l /var/www/auth-api/server-auth.js"
pause
