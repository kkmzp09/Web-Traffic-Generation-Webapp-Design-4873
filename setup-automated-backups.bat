@echo off
REM Setup Automated Daily Backups on VPS

echo ========================================
echo   Setting Up Automated Backups
echo ========================================
echo.

echo [1/4] Uploading backup script to VPS...
scp -o StrictHostKeyChecking=no server-files/backup-script.sh root@67.217.60.57:/root/
if %errorlevel% neq 0 (
    echo ERROR: Failed to upload backup script
    pause
    exit /b 1
)
echo [OK] Backup script uploaded
echo.

echo [2/4] Making script executable...
ssh -o StrictHostKeyChecking=no root@67.217.60.57 "chmod +x /root/backup-script.sh"
echo [OK] Script is executable
echo.

echo [3/4] Setting up daily cron job (runs at 2 AM)...
ssh -o StrictHostKeyChecking=no root@67.217.60.57 "crontab -l > /tmp/current_cron 2>/dev/null; echo '0 2 * * * /root/backup-script.sh >> /root/backup.log 2>&1' >> /tmp/current_cron; crontab /tmp/current_cron; rm /tmp/current_cron"
echo [OK] Cron job created
echo.

echo [4/4] Running initial backup...
ssh -o StrictHostKeyChecking=no root@67.217.60.57 "/root/backup-script.sh"
echo.

echo ========================================
echo   Backup System Configured!
echo ========================================
echo.
echo Backup Schedule:
echo   - Runs daily at 2:00 AM server time
echo   - Keeps last 7 days of backups
echo   - Location: /root/backups/
echo.
echo What gets backed up:
echo   - All server files (*.js)
echo   - Environment variables (.env)
echo   - PM2 configuration
echo   - PostgreSQL database
echo   - Nginx configuration
echo.
echo Manual backup command:
echo   ssh root@67.217.60.57 '/root/backup-script.sh'
echo.
echo View backup logs:
echo   ssh root@67.217.60.57 'tail -50 /root/backup.log'
echo.
echo List backups:
echo   ssh root@67.217.60.57 'ls -lh /root/backups/'
echo.
pause
