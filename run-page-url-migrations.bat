@echo off
echo Adding page_url columns to database...
ssh root@67.217.60.57 "cd /root/relay; node add-page-url-column.js; node add-page-url-to-fixes.js"
pause
