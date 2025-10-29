@echo off
echo Fixing server.js...
ssh root@67.217.60.57 "chmod +x /root/relay/fix-server-checkout.sh && /root/relay/fix-server-checkout.sh"
pause
