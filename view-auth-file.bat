@echo off
echo Viewing server-auth.js around line 12...
ssh root@67.217.60.57 "sed -n '1,20p' /var/www/auth-api/server-auth.js"
pause
