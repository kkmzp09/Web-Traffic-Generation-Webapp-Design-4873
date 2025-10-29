#!/bin/bash

echo "Testing DataForSEO API directly..."
echo ""

# Test with actual credentials
curl -X POST https://api.dataforseo.com/v3/on_page/task_post \
  -u "kk@jobmakers.in:d0ffa7da132e2819" \
  -H "Content-Type: application/json" \
  -d '[{
    "target": "https://example.com",
    "max_crawl_pages": 1,
    "enable_javascript": true
  }]' | jq '.'
