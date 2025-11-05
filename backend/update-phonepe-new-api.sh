#!/bin/bash

# Update PhonePe with NEW API credentials

ENV_FILE="/root/relay/.env"

# Remove old credentials
sed -i '/PHONEPE_MERCHANT_ID=/d' $ENV_FILE
sed -i '/PHONEPE_SALT_KEY=/d' $ENV_FILE
sed -i '/PHONEPE_SALT_INDEX=/d' $ENV_FILE
sed -i '/PHONEPE_ENV=/d' $ENV_FILE
sed -i '/PHONEPE_REDIRECT_URL=/d' $ENV_FILE
sed -i '/PHONEPE_CALLBACK_URL=/d' $ENV_FILE
sed -i '/PHONEPE_CLIENT_ID=/d' $ENV_FILE
sed -i '/PHONEPE_CLIENT_SECRET=/d' $ENV_FILE
sed -i '/PHONEPE_CLIENT_VERSION=/d' $ENV_FILE

# Add NEW API credentials
echo "" >> $ENV_FILE
echo "# PhonePe Payment Gateway - NEW Standard Checkout API" >> $ENV_FILE
echo "PHONEPE_CLIENT_ID=SU2511041740265064774398" >> $ENV_FILE
echo "PHONEPE_CLIENT_SECRET=6eb5396c-8c06-422e-8722-029679230caf" >> $ENV_FILE
echo "PHONEPE_CLIENT_VERSION=1" >> $ENV_FILE
echo "PHONEPE_ENV=production" >> $ENV_FILE
echo "PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success" >> $ENV_FILE
echo "PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback" >> $ENV_FILE

echo "✅ PhonePe NEW API credentials configured!"
echo ""
echo "🔐 Client ID: SU2511041740265064774398"
echo "🔢 Client Version: 1"
echo "🌍 Environment: PRODUCTION"
echo "💰 Ready to accept REAL payments with NEW API"
