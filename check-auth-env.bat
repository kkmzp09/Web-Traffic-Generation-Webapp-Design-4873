@echo off
echo Checking auth-api .env...
ssh root@67.217.60.57 "cat /var/www/auth-api/.env"
pause
