#!/bin/bash

ENV_FILE="/root/relay/.env"

# Update with CORRECT Client Secret
sed -i 's/PHONEPE_CLIENT_SECRET=.*/PHONEPE_CLIENT_SECRET=beb539bc-8c0b-422e-8722-029679230caf/' $ENV_FILE

echo "✅ Updated PhonePe Client Secret!"
echo "🔐 Client ID: SU2511041740265064774398"
echo "🔑 Client Secret: beb539bc-8c0b-422e-8722-029679230caf"
echo "🔢 Client Version: 1"
