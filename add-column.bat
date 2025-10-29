@echo off
scp add-updated-at.sh root@67.217.60.57:/root/relay/
ssh root@67.217.60.57 "bash /root/relay/add-updated-at.sh"
pause
