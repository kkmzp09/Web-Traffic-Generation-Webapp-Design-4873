@echo off
echo Uploading and running campaign check script on VPS...
echo.

REM Upload the script to VPS
scp check-campaign-detailed.sh root@67.217.60.57:/root/

REM Make it executable and run it
ssh root@67.217.60.57 "chmod +x /root/check-campaign-detailed.sh && /root/check-campaign-detailed.sh"

echo.
echo Script execution complete!
pause
