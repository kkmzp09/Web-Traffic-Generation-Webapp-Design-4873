#!/bin/bash
echo "Testing discount validation API..."
echo ""

curl -X POST http://localhost:3000/api/validate-discount \
  -H "Content-Type: application/json" \
  -d '{"code":"FREE100","planType":"seo_professional"}' \
  2>/dev/null | python3 -m json.tool 2>/dev/null || cat

echo ""
echo ""
echo "If you see success:true and discount info above, it works!"
