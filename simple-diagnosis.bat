@echo off
echo === PASSWORD RESET DIAGNOSIS ===
echo.
echo 1. Do reset columns exist in database?
ssh root@67.217.60.57 "psql $DATABASE_URL -c \"SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name LIKE 'reset%%';\""
echo.
echo 2. Does forgot-password endpoint exist in code?
ssh root@67.217.60.57 "grep -c 'forgot-password' /var/www/auth-api/server-auth.js"
echo.
echo 3. Is auth-api running without errors?
ssh root@67.217.60.57 "pm2 describe auth-api | grep status"
pause
