@echo off
echo Running database migration for websites table...
ssh root@67.217.60.57 "cd /root/relay; node run-create-websites-table.js"
pause
