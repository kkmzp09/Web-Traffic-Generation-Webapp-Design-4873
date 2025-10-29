#!/bin/bash
cd /root/relay

echo "Starting standalone test server..."
node test-checkout-standalone.js &
TEST_PID=$!

sleep 2

echo ""
echo "Testing discount validation..."
curl -X POST http://localhost:3002/api/validate-discount \
  -H "Content-Type: application/json" \
  -d '{"code":"FREE100","planType":"seo_professional"}' \
  2>/dev/null | python3 -m json.tool 2>/dev/null || cat

echo ""
echo ""
echo "Testing subscription creation..."
curl -X POST http://localhost:3002/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","planType":"seo_professional","amount":0}' \
  2>/dev/null | python3 -m json.tool 2>/dev/null || cat

echo ""
echo ""
echo "Stopping test server..."
kill $TEST_PID 2>/dev/null
