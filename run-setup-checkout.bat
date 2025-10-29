@echo off
echo Setting up checkout API on server...
ssh root@67.217.60.57 "chmod +x /root/relay/setup-checkout-api.sh && /root/relay/setup-checkout-api.sh"
pause
