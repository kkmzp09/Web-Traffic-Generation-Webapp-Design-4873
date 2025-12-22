#!/bin/bash
echo "Testing scan endpoint..."
curl -X GET "http://127.0.0.1:3001/api/seo/scan/141" \
  -H "Content-Type: application/json" \
  2>&1 | head -50
