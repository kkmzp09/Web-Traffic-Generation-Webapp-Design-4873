@echo off
echo Force reloading auth-api...
ssh root@67.217.60.57 "pm2 delete auth-api && pm2 start /var/www/auth-api/server-auth.js --name auth-api && pm2 save && pm2 logs auth-api --lines 10"
pause
