@echo off
echo Creating discount tables...
ssh root@67.217.60.57 "cd /root/relay; node create-discount-tables.js"
pause
