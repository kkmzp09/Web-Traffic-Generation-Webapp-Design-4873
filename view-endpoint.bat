@echo off
ssh root@67.217.60.57 "grep -A 20 'send-scan-email' /root/relay/seo-automation-api.js | head -30"
pause
