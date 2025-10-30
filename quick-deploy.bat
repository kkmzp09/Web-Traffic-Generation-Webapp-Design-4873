@echo off
git commit -m "Add new homepage with free scan feature"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
echo Done! Check https://organitrafficboost.com
pause
