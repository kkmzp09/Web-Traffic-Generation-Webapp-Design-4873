@echo off
echo Adding site_id column to database...
ssh root@67.217.60.57 "cd /root/relay; node add-site-id-column.js"
pause
