@echo off
echo Testing Keyword Research API...
echo.
curl -X POST https://api.organitrafficboost.com/api/seo/analyze-serp -H "Content-Type: application/json" -d "{\"keyword\":\"seo tools\",\"depth\":10}"
echo.
echo.
pause
