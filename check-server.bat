@echo off
ssh root@67.217.60.57 "ls -la /root/ && echo '---' && find /root -name 'server.js' -type f 2>/dev/null"
pause
