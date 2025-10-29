@echo off
echo Waiting for API...
timeout /t 5 /nobreak >nul

echo Testing results...
curl https://api.organitrafficboost.com/api/dataforseo/onpage/results/98

echo.
echo.
pause
