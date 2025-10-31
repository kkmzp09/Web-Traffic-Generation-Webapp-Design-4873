@echo off
echo Finding auth-api...
ssh root@67.217.60.57 "pm2 describe auth-api | grep -E 'script path|exec cwd'"
pause
