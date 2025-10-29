#!/bin/bash
cd /root/relay

# Check if routes already added
if grep -q "keyword-tracker-api" server.js; then
    echo "✅ Routes already added!"
    exit 0
fi

# Add routes before the last line
sed -i '/^$/i\
// Keyword Tracker API\
const keywordTrackerAPI = require("./keyword-tracker-api");\
app.use("/api/seo", keywordTrackerAPI);\
console.log("✅ Keyword Tracker routes initialized");\
' server.js

echo "✅ Routes added to server.js!"
echo "🔄 Restarting API..."
pm2 restart relay-api
