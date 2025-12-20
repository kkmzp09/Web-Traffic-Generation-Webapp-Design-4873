#!/bin/bash
# Test SmartProxy US configuration

echo "🧪 Testing US SmartProxy Configuration..."
echo "=========================================="
echo ""

# Send test request
curl -X POST http://127.0.0.1:8081/run \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: m7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp' \
  -d '{"urls": ["https://httpbin.org/ip"], "dwellMs": 3000, "scroll": false, "maxDepth": 0}'

echo ""
echo ""
echo "Waiting 5 seconds for test to complete..."
sleep 5

echo ""
echo "📋 Checking logs for proxy usage..."
echo "=========================================="
pm2 logs playwright-api --lines 30 --nostream | grep -A 5 -B 5 "httpbin"

echo ""
echo "✅ Test complete!"
