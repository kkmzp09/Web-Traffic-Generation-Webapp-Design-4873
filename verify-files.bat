@echo off
echo Checking if keyword tracker files exist on server...
ssh root@67.217.60.57 "ls -lh /root/relay/keyword* /root/relay/dataforseo-keywords*"
pause
