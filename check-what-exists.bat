@echo off
echo Checking what exists on server...
echo.
echo 1. Checking server.js:
ssh root@67.217.60.57 "grep -n 'free-scan' /root/relay/server.js"
echo.
echo 2. Checking if seo-automation-api.js exists:
ssh root@67.217.60.57 "ls -la /root/relay/seo-automation-api.js"
echo.
echo 3. Checking if sendScanEmail is imported:
ssh root@67.217.60.57 "grep -n 'sendScanEmail' /root/relay/seo-automation-api.js | head -5"
echo.
echo 4. Checking if send-scan-email endpoint already exists:
ssh root@67.217.60.57 "grep -n 'send-scan-email' /root/relay/seo-automation-api.js"
echo.
pause
