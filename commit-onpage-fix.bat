@echo off
git commit -m "Increase OnPage SEO scan timeout and add better error logging"
git push origin dev
npm run build
