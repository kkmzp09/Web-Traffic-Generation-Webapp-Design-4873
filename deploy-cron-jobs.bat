@echo off
echo ========================================
echo Step 2: Setting Up Cron Jobs
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && chmod +x setup-automated-monitoring.sh && ./setup-automated-monitoring.sh"
echo.
pause
