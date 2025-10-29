@echo off
echo ========================================
echo   Deploying Keyword Research Feature
echo ========================================
echo.

echo Step 1: Upload backend files...
scp server-files/keyword-tracker-api.js root@67.217.60.57:/root/relay/
scp server-files/dataforseo-keywords-service.js root@67.217.60.57:/root/relay/

echo.
echo Step 2: Restart API...
ssh root@67.217.60.57 "pm2 restart relay-api"

echo.
echo Step 3: Commit and push frontend...
git add -A
git commit -m "Add Keyword Research SERP Analyzer"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Backend: https://api.organitrafficboost.com/api/seo/analyze-serp
echo Frontend: https://organitrafficboost.com/keyword-research
echo.
echo Netlify will deploy in 1-2 minutes
echo.
pause
