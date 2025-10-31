@echo off
echo Uploading free-scan-api.js...
echo.
echo You will be prompted for your VPS password
echo.
scp server-files/free-scan-api.js root@165.232.177.47:/root/traffic-app/server-files/
echo.
if %errorlevel% equ 0 (
    echo SUCCESS! File uploaded.
    echo.
    echo Now run: 2-update-server.bat
) else (
    echo FAILED to upload
)
pause
