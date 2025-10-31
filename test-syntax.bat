@echo off
echo Testing syntax...
ssh root@67.217.60.57 "cd /var/www/auth-api && node server-auth.js 2>&1 | grep -A 5 'Error\|SyntaxError'"
pause
