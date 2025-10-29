@echo off
echo ========================================
echo FINAL DEPLOYMENT - DataForSEO On-Page
echo ========================================
echo.

ssh root@67.217.60.57 "chmod +x /root/relay/final-deploy.sh"
ssh root@67.217.60.57 "bash /root/relay/final-deploy.sh"

echo.
echo.
pause
