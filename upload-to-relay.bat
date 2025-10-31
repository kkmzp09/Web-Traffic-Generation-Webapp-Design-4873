@echo off
echo Creating server-files directory and uploading...
ssh root@67.217.60.57 "mkdir -p /root/relay/server-files"
scp server-files\free-scan-api.js root@67.217.60.57:/root/relay/server-files/
scp server-files\dataforseo-onpage-service.js root@67.217.60.57:/root/relay/server-files/
echo Done!
pause
