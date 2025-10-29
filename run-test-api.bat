@echo off
echo Testing API endpoints...
ssh root@67.217.60.57 "chmod +x /root/relay/test-api-direct.sh && /root/relay/test-api-direct.sh"
pause
