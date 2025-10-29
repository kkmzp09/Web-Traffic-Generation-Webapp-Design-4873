@echo off
echo Fixing checkout API properly...
ssh root@67.217.60.57 "chmod +x /root/relay/fix-checkout-properly.sh && /root/relay/fix-checkout-properly.sh"
pause
