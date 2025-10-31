@echo off
echo Checking for auth in relay directory...
ssh root@67.217.60.57 "cd /root/relay && grep -l 'auth.*login\|register' *.js | head -5"
echo.
echo Checking server.js for auth routes...
ssh root@67.217.60.57 "cd /root/relay && grep -n '/auth' server.js | head -10"
pause
