#!/bin/bash
cd /root/relay

echo "Adding DataForSEO routes to server.js..."

# Backup first
cp server.js server.js.backup-dataforseo

# Add the require statement after seoAutomationApi require
sed -i "/const seoAutomationApi = require/a const dataforSEOOnPageApi = require('./dataforseo-onpage-api');" server.js

# Add the route registration after SEO Automation routes
sed -i "/app.use('\/api\/seo', seoAutomationApi);/a \\
\\
// DataForSEO On-Page API\\
app.use('/api/dataforseo/onpage', dataforSEOOnPageApi);\\
console.log('✅ DataForSEO On-Page API routes initialized');" server.js

echo "✅ Routes added!"
echo ""
echo "Verifying..."
grep -A 2 "DataForSEO On-Page API" server.js

echo ""
echo "✅ Done! Restarting API..."
pm2 restart relay-api

echo ""
echo "Checking logs..."
sleep 2
pm2 logs relay-api --lines 10 --nostream | grep -i dataforseo
