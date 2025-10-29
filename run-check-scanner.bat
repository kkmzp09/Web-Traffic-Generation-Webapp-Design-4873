@echo off
echo Checking SEO Scanner status...
ssh root@67.217.60.57 "chmod +x /root/relay/check-seo-scanner.sh && /root/relay/check-seo-scanner.sh"
pause
