#!/bin/bash
echo "Testing Widget API..."
curl -s "http://localhost:3001/api/seo/widget/auto-fixes?domain=jobmakers.in" | jq '.success, .domain, .fixCount' 2>/dev/null || curl -s "http://localhost:3001/api/seo/widget/auto-fixes?domain=jobmakers.in"
