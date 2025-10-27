@echo off
git commit -m "Add before/after verification for auto-fixes"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
