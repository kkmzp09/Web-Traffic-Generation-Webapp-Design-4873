@echo off
echo Checking discount codes in database...
ssh root@67.217.60.57 "chmod +x /root/relay/check-discounts.sh && /root/relay/check-discounts.sh"
pause
