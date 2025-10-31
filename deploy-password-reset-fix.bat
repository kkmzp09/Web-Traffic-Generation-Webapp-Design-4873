@echo off
git commit -m "Fix password reset to use backend API"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
echo Done!
pause
