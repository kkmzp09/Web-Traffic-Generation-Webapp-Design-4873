@echo off
echo Running Node to find exact syntax error...
ssh root@67.217.60.57 "cd /var/www/auth-api && node --check server-auth.js 2>&1 | head -20"
pause
