#!/bin/bash
cd /root/relay

echo "Adding DataForSEO On-Page API routes to server.js..."
echo ""

# Backup server.js
cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"

# Check if routes already exist
if grep -q "dataforseo-onpage-api" server.js; then
    echo "⚠️  DataForSEO routes already exist in server.js"
    exit 0
fi

# Find the line with SEO Automation API
LINE=$(grep -n "app.use('/api/seo', seoAutomationApi)" server.js | head -1 | cut -d: -f1)

if [ -z "$LINE" ]; then
    echo "❌ Could not find SEO Automation API line"
    exit 1
fi

echo "Found SEO Automation API at line $LINE"

# Add the require statement at the top (after other requires)
REQUIRE_LINE=$(grep -n "const seoAutomationApi = require" server.js | head -1 | cut -d: -f1)
if [ ! -z "$REQUIRE_LINE" ]; then
    sed -i "${REQUIRE_LINE}a const dataforSEOOnPageApi = require('./dataforseo-onpage-api');" server.js
    echo "✅ Added require statement"
fi

# Add the route registration after SEO Automation API
NEXT_LINE=$((LINE + 1))
sed -i "${NEXT_LINE}i\\
\\
// DataForSEO On-Page API\\
app.use('/api/dataforseo/onpage', dataforSEOOnPageApi);\\
console.log('✅ DataForSEO On-Page API routes initialized');" server.js

echo "✅ Added route registration"
echo ""
echo "Verifying changes..."
grep -A 2 "DataForSEO On-Page API" server.js

echo ""
echo "✅ DataForSEO routes added successfully!"
