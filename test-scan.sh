#!/bin/bash
echo 'Starting scan...'
RESPONSE=$(curl -s -X POST https://organitrafficboost.com/api/seo/comprehensive-audit -H 'Content-Type: application/json' -d '{"url":"https://example.com","force_fresh":true}')
echo 'Response:'
echo $RESPONSE
SCAN_ID=$(echo $RESPONSE | grep -o '"scanId":[0-9]*' | grep -o '[0-9]*')
echo ''
echo 'Scan ID:' $SCAN_ID
echo ''
echo 'Waiting 90 seconds for scan to complete...'
sleep 90
echo ''
echo 'Fetching results...'
curl -s https://organitrafficboost.com/api/dataforseo/onpage/results/$SCAN_ID | python3 -m json.tool
