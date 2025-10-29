#!/bin/bash
cd /root/relay

echo "Finding correct location in server.js..."

# Find where other API routes are registered
grep -n "app.use.*api.*dataforseo" server.js | tail -1

# Add routes after the last dataforseo route
LINE=$(grep -n "app.use.*api.*dataforseo" server.js | tail -1 | cut -d: -f1)

if [ -n "$LINE" ]; then
    echo "Adding Keyword Tracker routes after line $LINE..."
    sed -i "${LINE}a\\
\\
// Keyword Tracker API\\
const keywordTrackerAPI = require('./keyword-tracker-api');\\
app.use('/api/seo', keywordTrackerAPI);\\
console.log('✅ Keyword Tracker routes initialized');
" server.js
    
    echo "✅ Routes added!"
else
    echo "❌ Could not find insertion point"
    exit 1
fi

echo ""
echo "Restarting API..."
pm2 restart relay-api

sleep 5

echo ""
echo "Checking logs..."
pm2 logs relay-api --lines 10 --nostream | grep -A2 -B2 "Keyword Tracker"
