#!/bin/bash

ENV_FILE="/root/relay/.env"

# Remove old credentials
sed -i '/PHONEPE_CLIENT_ID=/d' $ENV_FILE
sed -i '/PHONEPE_CLIENT_SECRET=/d' $ENV_FILE
sed -i '/PHONEPE_CLIENT_VERSION=/d' $ENV_FILE
sed -i '/PHONEPE_ENV=/d' $ENV_FILE

# Add TEST credentials
echo "" >> $ENV_FILE
echo "# PhonePe Payment Gateway - TEST MODE" >> $ENV_FILE
echo "PHONEPE_CLIENT_ID=TEST-M23NNG4JA354R-25110" >> $ENV_FILE
echo "PHONEPE_CLIENT_SECRET=MjPxYJAvYWFOTM5Z00MDkxLTh0OGQt2SVjNzdJMTI5NDAy" >> $ENV_FILE
echo "PHONEPE_CLIENT_VERSION=1" >> $ENV_FILE
echo "PHONEPE_ENV=test" >> $ENV_FILE
echo "PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success" >> $ENV_FILE
echo "PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback" >> $ENV_FILE

echo "✅ PhonePe TEST credentials configured!"
echo ""
echo "🔐 Client ID: TEST-M23NNG4JA354R-25110"
echo "🔢 Client Version: 1"
echo "🧪 Environment: TEST MODE"
