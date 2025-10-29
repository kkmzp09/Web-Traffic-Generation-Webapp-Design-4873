#!/bin/bash
cd /root/relay

echo "Backing up server.js..."
cp server.js server.js.backup

echo "Removing ALL keyword-tracker references..."
sed -i '/keyword-tracker-api/d' server.js
sed -i '/Keyword Tracker/d' server.js
sed -i '/\/api\/seo.*keywordTrackerAPI/d' server.js

echo "✅ Cleaned server.js"
echo ""
echo "Restarting to see if it works without keyword tracker..."
pm2 restart relay-api

sleep 5
curl -s http://127.0.0.1:3001/health || echo "API not responding"
