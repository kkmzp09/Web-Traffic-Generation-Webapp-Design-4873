#!/bin/bash
cd /var/www/auth-api

# Find the oldest backup (before I started messing with it)
echo "Available backups:"
ls -lt server-auth.js.backup* 2>/dev/null | tail -5

# Check if there's a backup from before password reset attempts
if [ -f "server-auth.js.backup-password-reset" ]; then
    echo "Using backup-password-reset"
    cp server-auth.js.backup-password-reset server-auth.js
else
    echo "No backup found, keeping current"
fi

# Start auth-api with PM2 (without ecosystem file)
pm2 delete auth-api 2>/dev/null
pm2 start server-auth.js --name auth-api
pm2 save

echo ""
echo "Auth-API started. Waiting for it to initialize..."
sleep 5
pm2 logs auth-api --lines 20 --nostream
