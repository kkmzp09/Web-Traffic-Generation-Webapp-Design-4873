#!/bin/bash
cd /var/www/auth-api

# Restore the original working backup
cp server-auth.js.backup-password-reset server-auth.js

# Delete the ecosystem file I created
rm -f ecosystem.config.js ecosystem.config.cjs

# Delete and restart with the original PM2 configuration
pm2 delete auth-api
pm2 start server-auth.js --name auth-api
pm2 save

echo "✅ Restored to original working state"
sleep 2
pm2 logs auth-api --lines 10
