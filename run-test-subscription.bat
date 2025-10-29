@echo off
echo Testing subscription creation...
ssh root@67.217.60.57 "chmod +x /root/relay/test-subscription-create.sh && /root/relay/test-subscription-create.sh"
pause
