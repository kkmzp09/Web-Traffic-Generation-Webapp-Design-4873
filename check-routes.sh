#!/bin/bash
cd /root/relay

echo "=== Checking server.js for checkout API ==="
echo ""
echo "Lines with 'checkout':"
grep -n -i "checkout" server.js

echo ""
echo ""
echo "=== Checking if checkout-api.js is being loaded ==="
echo ""

# Check PM2 logs for checkout initialization
pm2 logs relay-api --lines 50 --nostream 2>/dev/null | grep -i "checkout" || echo "No checkout logs found"

echo ""
echo ""
echo "=== Testing if route exists ==="
timeout 5 curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"test":"test"}' 2>&1 || echo "Request timed out or failed"
