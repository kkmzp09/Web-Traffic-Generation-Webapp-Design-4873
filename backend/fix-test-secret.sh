#!/bin/bash

ENV_FILE="/root/relay/.env"

# Update with CORRECT TEST Client Secret
sed -i 's/PHONEPE_CLIENT_SECRET=.*/PHONEPE_CLIENT_SECRET=MjFkYjAwYWEtOTM5ZC00MDkxLTlhOGQtZGVjNzdlMTI5NDAy/' $ENV_FILE

echo "✅ Updated PhonePe TEST Client Secret!"
echo "🔐 Client ID: TEST-M23NNG4JA354R_25110"
echo "🔑 Client Secret: MjFkYjAwYWEtOTM5ZC00MDkxLTlhOGQtZGVjNzdlMTI5NDAy"
echo "🔢 Client Version: 1"
