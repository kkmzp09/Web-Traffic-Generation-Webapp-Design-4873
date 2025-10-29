#!/bin/bash
cd /root/relay

echo "Downloading server.js to see structure..."
tail -100 server.js > /tmp/server-end.txt
cat /tmp/server-end.txt

echo ""
echo "==================================="
echo "I'll create a simple test to verify the module works..."

# Test if the checkout-api module can be loaded
node << 'ENDNODE'
try {
  const checkoutApi = require('./checkout-api.js');
  console.log('✅ checkout-api.js loads successfully');
  console.log('✅ Module type:', typeof checkoutApi);
  console.log('✅ Is router:', checkoutApi.constructor.name);
} catch (e) {
  console.log('❌ Error loading checkout-api.js:', e.message);
  console.log(e.stack);
}
ENDNODE
