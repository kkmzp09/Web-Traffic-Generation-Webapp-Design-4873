@echo off
echo ========================================
echo Step 1: Creating Database Tables
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && node run-db-setup.js"
echo.
pause
