#!/bin/bash
cd /root/relay

echo "Adding DataForSEO routes to server.js at exact location..."

# Backup
cp server.js server.js.backup-exact

# Add require at line 298 (after seoAutomationRoutes)
sed -i '298a\  const dataforSEOOnPageApi = require('\''./dataforseo-onpage-api.js'\'');' server.js

# Add route at line 299 (after app.use seo)
sed -i '300a\  app.use('\''/api/dataforseo/onpage'\'', dataforSEOOnPageApi);\n  console.log('\''✅ DataForSEO On-Page API routes initialized'\'');' server.js

echo "✅ Routes added!"
echo ""
echo "Verifying..."
sed -n '298,305p' server.js

echo ""
echo "Restarting..."
pm2 restart relay-api

sleep 2
echo ""
echo "Checking logs..."
pm2 logs relay-api --lines 15 --nostream | tail -10
