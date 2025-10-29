@echo off
echo ========================================
echo Test 1: DataForSEO API
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && node test-dataforseo.js"
echo.
echo.
echo ========================================
echo Test 2: Resend Email API
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && node test-email.js"
echo.
echo.
echo ========================================
echo All Tests Complete!
echo ========================================
pause
