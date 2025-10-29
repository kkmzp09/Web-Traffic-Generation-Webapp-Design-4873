@echo off
scp check-scan-tables.sh root@67.217.60.57:/root/relay/
ssh root@67.217.60.57 "chmod +x /root/relay/check-scan-tables.sh"
ssh root@67.217.60.57 "/root/relay/check-scan-tables.sh"
pause
