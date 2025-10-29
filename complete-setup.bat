@echo off
echo ========================================
echo Completing DataForSEO Setup
echo ========================================
echo.

echo Adding column to Neon database and testing...
ssh root@67.217.60.57 "chmod +x /root/relay/final-add-column.sh"
ssh root@67.217.60.57 "bash /root/relay/final-add-column.sh"

echo.
echo.
pause
