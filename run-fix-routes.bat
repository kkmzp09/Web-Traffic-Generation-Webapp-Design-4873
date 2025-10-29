@echo off
echo Fixing checkout routes...
ssh root@67.217.60.57 "chmod +x /root/relay/fix-checkout-routes.sh && /root/relay/fix-checkout-routes.sh"
pause
