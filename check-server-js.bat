@echo off
echo Checking server.js...
ssh root@67.217.60.57 "cd /root/relay && tail -50 server.js"
pause
