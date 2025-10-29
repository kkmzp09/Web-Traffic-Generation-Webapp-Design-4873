@echo off
echo Verifying checkout API route...
ssh root@67.217.60.57 "chmod +x /root/relay/verify-checkout-route.sh && /root/relay/verify-checkout-route.sh"
pause
