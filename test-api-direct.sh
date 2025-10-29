#!/bin/bash
# Test the discount API directly from the server

echo "Testing discount validation API..."
echo ""

curl -X POST http://localhost:3000/api/validate-discount \
  -H "Content-Type: application/json" \
  -d '{"code":"FREE100","planType":"seo_professional"}' \
  -v

echo ""
echo ""
echo "Testing from external URL..."
curl -X POST https://api.organitrafficboost.com/api/validate-discount \
  -H "Content-Type: application/json" \
  -d '{"code":"FREE100","planType":"seo_professional"}' \
  -v
