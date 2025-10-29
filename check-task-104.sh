#!/bin/bash

echo "Checking DataForSEO task 10291256-1191-0216-0000-7b55019647ce..."
curl -u "kk@jobmakers.in:d0ffa7da132e2819" \
  https://api.dataforseo.com/v3/on_page/summary/10291256-1191-0216-0000-7b55019647ce | jq '.tasks[0].result[0].crawl_progress'
