@echo off
REM Campaign Analysis for Job ID: 1762494336711
REM This script checks the campaign from your local machine

set JOB_ID=1762494336711
set VPS_IP=67.217.60.57

echo ===============================================================
echo CAMPAIGN ANALYSIS - Job ID: %JOB_ID%
echo ===============================================================
echo.

echo [1/5] Checking campaign results from VPS...
echo ---------------------------------------------------------------
curl -s http://%VPS_IP%:3001/results/%JOB_ID%
echo.
echo.

echo [2/5] Checking campaign status from VPS...
echo ---------------------------------------------------------------
curl -s http://%VPS_IP%:3001/status/%JOB_ID%
echo.
echo.

echo [3/5] Listing recent campaigns...
echo ---------------------------------------------------------------
curl -s http://%VPS_IP%:3001/campaigns
echo.
echo.

echo [4/5] Checking VPS server health...
echo ---------------------------------------------------------------
curl -s http://%VPS_IP%:3001/health
echo.
echo.

echo [5/5] Uploading VPS check script...
echo ---------------------------------------------------------------
echo To run detailed analysis on VPS, execute:
echo.
echo scp check-vps-campaign-1762494336711.sh root@%VPS_IP%:/root/
echo ssh root@%VPS_IP% "chmod +x /root/check-vps-campaign-1762494336711.sh && /root/check-vps-campaign-1762494336711.sh"
echo.

echo ===============================================================
echo ANALYSIS COMPLETE
echo ===============================================================
echo.
echo NEXT STEPS:
echo 1. Open your browser and go to: https://organitrafficboost.com
echo 2. Open Developer Console (F12)
echo 3. Run the browser analysis script:
echo    - Copy contents of: analyze-campaign-1762494336711.js
echo    - Paste into console and press Enter
echo.
echo For detailed VPS logs:
echo - SSH into VPS: ssh root@%VPS_IP%
echo - Run: pm2 logs relay-api --lines 100
echo.
pause
