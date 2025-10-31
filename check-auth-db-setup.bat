@echo off
echo Checking auth-api database setup...
echo.
echo === Checking imports and database connection ===
ssh root@67.217.60.57 "head -30 /var/www/auth-api/server-auth.js | grep -E 'import|Pool|drizzle|neon'"
echo.
echo === Checking if Drizzle is installed ===
ssh root@67.217.60.57 "cd /var/www/auth-api && npm list | grep -E 'drizzle|@neondatabase'"
pause
