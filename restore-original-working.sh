#!/bin/bash
cd /var/www/auth-api

# Use the oldest backup from Oct 19 (before I touched anything)
if [ -f "server-auth.js.backup" ]; then
    echo "Restoring original backup from Oct 19..."
    cp server-auth.js.backup server-auth.js
else
    echo "ERROR: No original backup found!"
    exit 1
fi

# Restart auth-api
pm2 restart auth-api
sleep 3
pm2 logs auth-api --lines 10 --nostream
