#!/bin/bash
cd /root/relay

echo "=== Last 50 lines of server.js ==="
tail -50 server.js | cat -n

echo ""
echo "=== Checking if checkout-api.js exists ==="
ls -lh checkout-api.js

echo ""
echo "=== Testing if checkout-api can be required ==="
node -e "try { const api = require('./checkout-api.js'); console.log('✅ Module loads successfully'); console.log('Routes:', Object.keys(api)); } catch(e) { console.log('❌ Error:', e.message); }"
