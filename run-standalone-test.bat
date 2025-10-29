@echo off
echo Testing checkout API standalone...
ssh root@67.217.60.57 "chmod +x /root/relay/test-standalone.sh && /root/relay/test-standalone.sh"
pause
