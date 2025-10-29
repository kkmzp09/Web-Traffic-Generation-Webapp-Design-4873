@echo off
echo ========================================
echo Testing Resend Email API
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && node test-email-resend.js"
echo.
pause
