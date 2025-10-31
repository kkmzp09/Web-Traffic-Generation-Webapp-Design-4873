@echo off
echo Stopping auth-api to prevent crash loop...
ssh root@67.217.60.57 "pm2 stop auth-api && echo '' && echo 'Checking DATABASE_URL...' && cat /var/www/auth-api/.env | grep DATABASE_URL"
pause
