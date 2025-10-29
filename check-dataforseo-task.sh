#!/bin/bash

# Check the actual DataForSEO task status
# Task ID from scan 98: 10290501-1191-0216-0000-41e4798b056d

echo "Checking DataForSEO task status..."
curl -u "kk@jobmakers.in:d0ffa7da132e2819" \
  https://api.dataforseo.com/v3/on_page/summary/10290501-1191-0216-0000-41e4798b056d | jq '.'
