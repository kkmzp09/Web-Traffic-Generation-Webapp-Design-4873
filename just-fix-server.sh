#!/bin/bash
cd /root/relay

echo "Removing bad free-scan-api imports from server.js..."
cp server.js server.js.backup-remove-freescan
sed -i '/free-scan-api/d' server.js

echo "Restarting relay-api..."
pm2 restart relay-api
sleep 2
pm2 logs relay-api --lines 20
