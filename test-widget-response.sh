#!/bin/bash
echo "Testing widget API response..."
curl -s "https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=jobmakers.in" | head -30
