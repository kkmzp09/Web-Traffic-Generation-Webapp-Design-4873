#!/bin/bash
cd /root/relay

# Remove the incorrectly added routes from the top
sed -i '1,20{/keyword-tracker-api/d; /Keyword Tracker/d;}' server.js

# Find where other routes are registered and add ours there
# Look for a line with "app.use" and add before the server starts
sed -i '/app.listen\|Relay listening/i\
// Keyword Tracker API\
const keywordTrackerAPI = require("./keyword-tracker-api");\
app.use("/api/seo", keywordTrackerAPI);\
console.log("✅ Keyword Tracker routes initialized");\
' server.js

echo "✅ Fixed server.js!"
pm2 restart relay-api
sleep 3
pm2 logs relay-api --lines 10 --nostream
