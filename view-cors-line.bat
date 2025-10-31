@echo off
echo Viewing CORS_ORIGINS line...
ssh root@67.217.60.57 "sed -n '12p' /var/www/auth-api/server-auth.js"
pause
