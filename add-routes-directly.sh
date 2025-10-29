#!/bin/bash
cd /root/relay

# First, let's see the current server.js structure
echo "Current server.js structure:"
grep -n "app.use" server.js | head -20

echo ""
echo "Adding Keyword Tracker routes..."

# Find the line number where we should add (after other app.use statements)
LINE_NUM=$(grep -n "app.listen\|server.listen\|Relay listening" server.js | head -1 | cut -d: -f1)

if [ -z "$LINE_NUM" ]; then
    echo "Could not find app.listen, adding at end of file"
    cat >> server.js << 'ROUTES'

// Keyword Tracker API
const keywordTrackerAPI = require('./keyword-tracker-api');
app.use('/api/seo', keywordTrackerAPI);
console.log('✅ Keyword Tracker routes initialized');
ROUTES
else
    # Insert before app.listen
    BEFORE_LINE=$((LINE_NUM - 1))
    sed -i "${BEFORE_LINE}a\\
\\
// Keyword Tracker API\\
const keywordTrackerAPI = require('./keyword-tracker-api');\\
app.use('/api/seo', keywordTrackerAPI);\\
console.log('✅ Keyword Tracker routes initialized');\\
" server.js
fi

echo "✅ Routes added!"
echo ""
echo "Restarting API..."
pm2 restart relay-api

sleep 5

echo ""
echo "Checking if routes loaded..."
pm2 logs relay-api --lines 5 --nostream | grep "Keyword Tracker"
