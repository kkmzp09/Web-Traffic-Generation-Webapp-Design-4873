@echo off
echo Checking default Nginx config for web root...
ssh root@67.217.60.57 "cat /etc/nginx/sites-enabled/default | grep -A 5 'server_name.*organitrafficboost' | grep root"
pause
