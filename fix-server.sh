#!/bin/bash
cd /root/relay

echo "Fixing server.js - removing duplicate routes..."

# Remove all keyword-tracker-api lines
sed -i '/keyword-tracker-api/d' server.js
sed -i '/Keyword Tracker API/d' server.js
sed -i '/Keyword Tracker routes initialized/d' server.js

# Add it once at the end, before the last line
echo '
// Keyword Tracker API
const keywordTrackerAPI = require("./keyword-tracker-api");
app.use("/api/seo", keywordTrackerAPI);
console.log("✅ Keyword Tracker routes initialized");
' >> server.js

echo "✅ Fixed! Restarting..."
pm2 restart relay-api
