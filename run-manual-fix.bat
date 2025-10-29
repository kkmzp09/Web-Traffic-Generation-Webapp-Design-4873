@echo off
echo Manually fixing server.js...
ssh root@67.217.60.57 "chmod +x /root/relay/manual-fix-server.sh && /root/relay/manual-fix-server.sh"
pause
