@echo off
echo ========================================
echo   Deploying Keyword Tracker Frontend
echo ========================================
echo.

echo Step 1: Committing changes...
git commit -m "Add Keyword Tracker with DataForSEO integration"

echo.
echo Step 2: Pushing to dev branch...
git push origin dev

echo.
echo Step 3: Merging to main...
git checkout main
git merge dev
git push origin main

echo.
echo Step 4: Going back to dev...
git checkout dev

echo.
echo ========================================
echo   Frontend Deployment Complete!
echo ========================================
echo.
echo Netlify will automatically deploy in 1-2 minutes
echo.
echo Test at: https://organitrafficboost.com/keyword-tracker
echo.
pause
