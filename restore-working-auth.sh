#!/bin/bash
cd /var/www/auth-api

# Restore to the working backup
cp server-auth.js.backup-password-reset server-auth.js

echo "✅ Restored to working version"
pm2 restart auth-api
sleep 2
pm2 logs auth-api --lines 10
