#!/bin/bash

ENV_FILE="/root/relay/.env"

# Fix Client ID - use underscore not dash
sed -i 's/PHONEPE_CLIENT_ID=.*/PHONEPE_CLIENT_ID=TEST-M23NNG4JA354R_25110/' $ENV_FILE

echo "✅ Fixed PhonePe TEST Client ID!"
echo "🔐 Client ID: TEST-M23NNG4JA354R_25110 (with underscore)"
