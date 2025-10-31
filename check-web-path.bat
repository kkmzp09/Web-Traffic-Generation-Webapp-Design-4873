@echo off
echo Checking web directory...
ssh root@67.217.60.57 "ls -la /var/www/ | grep organi"
pause
