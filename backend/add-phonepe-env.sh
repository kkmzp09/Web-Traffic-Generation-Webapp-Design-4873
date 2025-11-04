#!/bin/bash

# Add PhonePe environment variables to .env file

ENV_FILE="/root/relay/.env"

echo "" >> $ENV_FILE
echo "# PhonePe Payment Gateway Configuration" >> $ENV_FILE
echo "# Get credentials from: https://business.phonepe.com/" >> $ENV_FILE
echo "PHONEPE_MERCHANT_ID=PGTESTPAYUAT" >> $ENV_FILE
echo "PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399" >> $ENV_FILE
echo "PHONEPE_SALT_INDEX=1" >> $ENV_FILE
echo "PHONEPE_ENV=sandbox" >> $ENV_FILE
echo "PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success" >> $ENV_FILE
echo "PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback" >> $ENV_FILE

echo "✅ PhonePe environment variables added to $ENV_FILE"
echo ""
echo "📝 Using PhonePe TEST credentials (sandbox mode)"
echo "   Merchant ID: PGTESTPAYUAT"
echo "   Environment: sandbox"
echo ""
echo "⚠️  These are TEST credentials. Replace with production credentials when ready."
