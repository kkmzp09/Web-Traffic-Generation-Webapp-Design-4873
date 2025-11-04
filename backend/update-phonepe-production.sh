#!/bin/bash

# Update PhonePe with PRODUCTION credentials

ENV_FILE="/root/relay/.env"

# Remove old test credentials
sed -i '/PHONEPE_MERCHANT_ID=/d' $ENV_FILE
sed -i '/PHONEPE_SALT_KEY=/d' $ENV_FILE
sed -i '/PHONEPE_SALT_INDEX=/d' $ENV_FILE
sed -i '/PHONEPE_ENV=/d' $ENV_FILE
sed -i '/PHONEPE_REDIRECT_URL=/d' $ENV_FILE
sed -i '/PHONEPE_CALLBACK_URL=/d' $ENV_FILE

# Add production credentials
echo "" >> $ENV_FILE
echo "# PhonePe Payment Gateway - PRODUCTION Credentials" >> $ENV_FILE
echo "PHONEPE_MERCHANT_ID=SU2511041740265064774398" >> $ENV_FILE
echo "PHONEPE_SALT_KEY=6eb5396c-8c06-422e-8722-029679230caf" >> $ENV_FILE
echo "PHONEPE_SALT_INDEX=1" >> $ENV_FILE
echo "PHONEPE_ENV=production" >> $ENV_FILE
echo "PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success" >> $ENV_FILE
echo "PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback" >> $ENV_FILE

echo "✅ PhonePe PRODUCTION credentials configured!"
echo ""
echo "🔐 Merchant ID: SU2511041740265064774398"
echo "🌍 Environment: PRODUCTION"
echo "💰 Ready to accept REAL payments"
echo ""
echo "⚠️  IMPORTANT: This is now LIVE and will process real transactions!"
