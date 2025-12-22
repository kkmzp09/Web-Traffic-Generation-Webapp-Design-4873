#!/bin/bash
echo "=== VPS DEPLOYMENT VERIFICATION ==="
echo ""
echo "1. Check apply-fixes-api.js exists:"
ls -lh /root/relay/apply-fixes-api.js
echo ""
echo "2. Check if mounted in seo-automation-api.js:"
grep -n "apply-fixes" /root/relay/seo-automation-api.js
echo ""
echo "3. Check PM2 status:"
pm2 list | grep relay-api
echo ""
echo "4. Test API endpoint:"
curl -s -X POST http://localhost:3001/api/seo/apply-fix \
  -H "Content-Type: application/json" \
  -d '{}' | head -20
