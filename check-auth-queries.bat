@echo off
echo Checking how auth-api queries the database...
echo.
echo === Login query ===
ssh root@67.217.60.57 "grep -A 10 'POST.*login' /var/www/auth-api/server-auth.js | grep -E 'pool.query|db.select|drizzle'"
echo.
echo === Register query ===
ssh root@67.217.60.57 "grep -A 10 'POST.*register' /var/www/auth-api/server-auth.js | grep -E 'pool.query|db.insert|drizzle'"
echo.
echo === Checking for drizzle usage ===
ssh root@67.217.60.57 "grep -c 'db.select\|db.insert\|db.update' /var/www/auth-api/server-auth.js"
echo.
echo === Checking for pg Pool usage ===
ssh root@67.217.60.57 "grep -c 'pool.query' /var/www/auth-api/server-auth.js"
pause
