#!/bin/bash
echo "Testing auth-api directly on port 8080..."
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"vintrip03@gmail.com"}'
echo ""
