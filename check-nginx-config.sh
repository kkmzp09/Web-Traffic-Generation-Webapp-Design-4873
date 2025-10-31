#!/bin/bash
echo "=== Checking Nginx config for api.organitrafficboost.com ==="
cat /etc/nginx/sites-enabled/api.organitrafficboost.com 2>/dev/null || echo "Config file not found"
echo ""
echo "=== Checking if auth routes exist ==="
grep -n "location.*auth" /etc/nginx/sites-enabled/api.organitrafficboost.com 2>/dev/null || echo "No auth routes found"
