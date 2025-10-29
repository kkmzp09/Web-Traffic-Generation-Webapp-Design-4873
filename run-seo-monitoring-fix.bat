@echo off
echo Fixing seo_monitoring table...
ssh root@67.217.60.57 "chmod +x /root/relay/run-fix-seo-monitoring.sh && /root/relay/run-fix-seo-monitoring.sh"
pause
