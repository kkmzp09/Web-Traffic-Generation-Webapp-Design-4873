#!/bin/bash
cd /var/www/auth-api

# Backup
cp server-auth.js server-auth.js.backup-cors-fix

# Fix CORS_ORIGINS to be an array
sed -i "s/const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').*/const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim());/" server-auth.js

echo "Fixed CORS_ORIGINS. Restarting auth-api..."
pm2 restart auth-api
sleep 2
pm2 logs auth-api --lines 10
