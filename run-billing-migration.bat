@echo off
echo Adding billing columns to subscriptions table...
ssh root@67.217.60.57 "chmod +x /root/relay/run-add-billing-columns.sh && /root/relay/run-add-billing-columns.sh"
pause
