@echo off
echo Generating site IDs for existing websites...
ssh root@67.217.60.57 "cd /root/relay; node generate-missing-site-ids.js"
pause
