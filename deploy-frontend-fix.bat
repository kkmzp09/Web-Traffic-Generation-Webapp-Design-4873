@echo off
echo Deploying frontend fix...
git add -A
git commit -m "Fix DataForSEO results transformation"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
echo.
echo Deployed! Wait 1-2 minutes for Netlify.
pause
