@echo off
REM Download backup from VPS to local machine

echo ========================================
echo   Download Backup from VPS
echo ========================================
echo.

REM Create local backups directory
if not exist "backups" mkdir backups

echo [1/2] Listing available backups on VPS...
echo.
ssh -o StrictHostKeyChecking=no root@67.217.60.57 "ls -lh /root/backups/*.tar.gz"
echo.

set /p BACKUP_FILE="Enter backup filename to download: "

if "%BACKUP_FILE%"=="" (
    echo ERROR: No filename provided
    pause
    exit /b 1
)

echo.
echo [2/2] Downloading %BACKUP_FILE%...
scp -o StrictHostKeyChecking=no root@67.217.60.57:/root/backups/%BACKUP_FILE% backups/
if %errorlevel% neq 0 (
    echo ERROR: Failed to download backup
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Download Complete!
echo ========================================
echo.
echo Backup saved to: backups\%BACKUP_FILE%
echo.
dir backups\%BACKUP_FILE%
echo.
pause
