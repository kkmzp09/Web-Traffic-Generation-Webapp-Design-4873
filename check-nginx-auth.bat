@echo off
echo Checking Nginx configuration for auth routes...
ssh root@67.217.60.57 "grep -A 10 'location.*auth' /etc/nginx/sites-enabled/api.organitrafficboost.com"
pause
