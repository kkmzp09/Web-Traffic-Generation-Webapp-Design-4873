#!/bin/bash

echo "Testing PhonePe OAuth Token Endpoint..."
echo ""
echo "Credentials:"
echo "Client ID: SU2511041740265064774398"
echo "Client Version: 1"
echo ""

# Test with /apis/pg-sandbox
echo "=== Testing: https://api.phonepe.com/apis/pg-sandbox/v1/oauth/token ==="
curl -v --location 'https://api.phonepe.com/apis/pg-sandbox/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'

echo ""
echo ""

# Test with /apis/pg
echo "=== Testing: https://api.phonepe.com/apis/pg/v1/oauth/token ==="
curl -v --location 'https://api.phonepe.com/apis/pg/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'

echo ""
echo ""

# Test with /apis/merchant-onboarding
echo "=== Testing: https://api.phonepe.com/apis/merchant-onboarding/v1/oauth/token ==="
curl -v --location 'https://api.phonepe.com/apis/merchant-onboarding/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'
