@echo off
scp check-dataforseo-error.sh root@67.217.60.57:/root/relay/
ssh root@67.217.60.57 "bash /root/relay/check-dataforseo-error.sh"
pause
