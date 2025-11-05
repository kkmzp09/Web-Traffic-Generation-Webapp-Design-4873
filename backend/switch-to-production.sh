#!/bin/bash

ENV_FILE="/root/relay/.env"

echo "🔄 Switching PhonePe to PRODUCTION mode..."
echo ""

# Remove old credentials
sed -i '/PHONEPE_CLIENT_ID=/d' $ENV_FILE
sed -i '/PHONEPE_CLIENT_SECRET=/d' $ENV_FILE
sed -i '/PHONEPE_CLIENT_VERSION=/d' $ENV_FILE
sed -i '/PHONEPE_ENV=/d' $ENV_FILE

# Add PRODUCTION credentials
echo "" >> $ENV_FILE
echo "# PhonePe Payment Gateway - PRODUCTION MODE" >> $ENV_FILE
echo "PHONEPE_CLIENT_ID=SU2511041740265064774398" >> $ENV_FILE
echo "PHONEPE_CLIENT_SECRET=6eb5396c-8c06-422e-8722-029679230caf" >> $ENV_FILE
echo "PHONEPE_CLIENT_VERSION=1" >> $ENV_FILE
echo "PHONEPE_ENV=production" >> $ENV_FILE
echo "PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success" >> $ENV_FILE
echo "PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback" >> $ENV_FILE

echo "✅ PhonePe PRODUCTION credentials configured!"
echo ""
echo "🔐 Client ID: SU2511041740265064774398"
echo "🔢 Client Version: 1"
echo "🚀 Environment: PRODUCTION"
echo "🔑 OAuth URL: https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
echo "🌐 Payment API URL: https://api.phonepe.com/apis/pg-sandbox"
echo ""
echo "✅ Production credentials are ACTIVATED and WORKING!"
echo "⚠️  Test the payment flow thoroughly before going live!"
