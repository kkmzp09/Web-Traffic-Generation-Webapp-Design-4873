@echo off
echo Checking routes...
ssh root@67.217.60.57 "chmod +x /root/relay/check-routes.sh && /root/relay/check-routes.sh"
pause
