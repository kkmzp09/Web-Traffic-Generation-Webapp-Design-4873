@echo off
echo Cleaning and fixing server.js...
ssh root@67.217.60.57 "chmod +x /root/relay/clean-server-fix.sh && /root/relay/clean-server-fix.sh"
pause
