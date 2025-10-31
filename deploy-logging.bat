@echo off
git commit -m "Add logging to email submission"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
echo Done!
pause
