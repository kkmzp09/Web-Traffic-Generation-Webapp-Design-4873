@echo off
ssh root@67.217.60.57 "ls -la /root/relay/ && echo '---' && cat /root/relay/server.js | head -30"
pause
