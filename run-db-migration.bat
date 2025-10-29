@echo off
echo Running database migration...
ssh root@67.217.60.57 "cd /root/relay; node run-add-columns.js"
pause
