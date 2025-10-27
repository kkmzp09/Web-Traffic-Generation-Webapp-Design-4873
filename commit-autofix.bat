@echo off
git commit -m "Add Auto-Fix buttons with widget integration"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
