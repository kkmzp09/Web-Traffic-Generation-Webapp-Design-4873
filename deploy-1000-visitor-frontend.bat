@echo off
REM Deploy Frontend for 1000 Visitor Support

echo ===============================================================
echo DEPLOYING FRONTEND - 1000 Visitor Support
echo ===============================================================
echo.

echo [1/6] Committing changes...
git commit -m "max-visitor-10000"
echo.

echo [2/6] Pushing to dev branch...
git push origin dev
echo.

echo [3/6] Switching to main branch...
git checkout main
echo.

echo [4/6] Merging dev into main...
git merge dev
echo.

echo [5/6] Pushing to main...
git push origin main
echo.

echo [6/6] Switching back to dev...
git checkout dev
echo.

echo ===============================================================
echo DEPLOYMENT COMPLETE!
echo ===============================================================
echo.
echo GitHub Actions will automatically deploy to Netlify.
echo Check: https://organitrafficboost.com in 2-3 minutes
echo.
pause
