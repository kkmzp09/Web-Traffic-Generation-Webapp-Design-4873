@echo off
echo Cleaning up and restarting...
ssh root@67.217.60.57 "chmod +x /root/cleanup-and-restart.sh && bash /root/cleanup-and-restart.sh"
pause
