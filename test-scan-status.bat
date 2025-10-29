@echo off
echo Testing scan status for scanId 98...
echo.

curl https://api.organitrafficboost.com/api/dataforseo/onpage/status/98

echo.
echo.
echo Testing results...
curl https://api.organitrafficboost.com/api/dataforseo/onpage/results/98

echo.
echo.
pause
