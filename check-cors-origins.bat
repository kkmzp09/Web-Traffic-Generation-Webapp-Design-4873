@echo off
echo Checking CORS_ORIGINS...
ssh root@67.217.60.57 "grep -n 'CORS_ORIGINS' /var/www/auth-api/server-auth.js | head -10"
pause
