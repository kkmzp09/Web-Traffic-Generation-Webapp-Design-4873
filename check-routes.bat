@echo off
scp check-server-routes.sh root@67.217.60.57:/root/relay/
ssh root@67.217.60.57 "chmod +x /root/relay/check-server-routes.sh"
ssh root@67.217.60.57 "bash /root/relay/check-server-routes.sh"
pause
