#!/bin/bash
echo "Checking for Title Too Long fix..."
curl -s "https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=jobmakers.in" | grep -A 30 "Title Too Long"
