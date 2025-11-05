#!/bin/bash

echo "Testing Production OAuth Endpoint..."
echo ""

curl --location 'https://api.phonepe.com/apis/pg-sandbox/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'

echo ""
echo ""
echo "If you see an access_token above, production is activated!"
echo "If you see 'Api Mapping Not Found', production is NOT activated yet."
