#!/bin/bash

echo "Testing ALL possible Production OAuth Endpoints..."
echo ""
echo "=================================================="
echo ""

# Test 1: /apis/pg-sandbox
echo "TEST 1: https://api.phonepe.com/apis/pg-sandbox/v1/oauth/token"
curl -s --location 'https://api.phonepe.com/apis/pg-sandbox/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'
echo ""
echo ""

# Test 2: /apis/pg
echo "TEST 2: https://api.phonepe.com/apis/pg/v1/oauth/token"
curl -s --location 'https://api.phonepe.com/apis/pg/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'
echo ""
echo ""

# Test 3: /apis/hermes
echo "TEST 3: https://api.phonepe.com/apis/hermes/v1/oauth/token"
curl -s --location 'https://api.phonepe.com/apis/hermes/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'
echo ""
echo ""

# Test 4: /apis/merchant-onboarding
echo "TEST 4: https://api.phonepe.com/apis/merchant-onboarding/v1/oauth/token"
curl -s --location 'https://api.phonepe.com/apis/merchant-onboarding/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'
echo ""
echo ""

# Test 5: /v1/oauth/token (no /apis prefix)
echo "TEST 5: https://api.phonepe.com/v1/oauth/token"
curl -s --location 'https://api.phonepe.com/v1/oauth/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=SU2511041740265064774398' \
  --data-urlencode 'client_version=1' \
  --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
  --data-urlencode 'grant_type=client_credentials'
echo ""
echo ""

echo "=================================================="
echo "Look for 'access_token' in any of the responses above!"
echo "If all show errors, ask PhonePe support for the EXACT production endpoint URL."
