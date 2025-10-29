@echo off
ssh root@67.217.60.57 "head -20 /root/relay/server.js && echo '...' && tail -30 /root/relay/server.js"
pause
