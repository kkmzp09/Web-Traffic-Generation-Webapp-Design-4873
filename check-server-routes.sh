#!/bin/bash
cd /root/relay

echo "Checking if DataForSEO routes exist in server.js..."
echo ""

echo "1. Checking require statement:"
grep "dataforSEOOnPageApi" server.js | head -3

echo ""
echo "2. Checking route registration:"
grep -A 2 "dataforseo/onpage" server.js

echo ""
echo "3. Checking if file exists:"
ls -lh dataforseo-onpage-api.js

echo ""
echo "4. Testing file can be required:"
node -e "try { const api = require('./dataforseo-onpage-api'); console.log('✅ File loads successfully'); } catch(e) { console.log('❌ Error:', e.message); }"
