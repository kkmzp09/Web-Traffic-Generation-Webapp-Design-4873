#!/bin/bash
cd /root/email-api

# Backup .env
cp .env .env.backup

# Update FROM_EMAIL to use verified domain
sed -i 's/FROM_EMAIL=onboarding@resend.dev/FROM_EMAIL=noreply@organitrafficboost.com/' .env

echo "Updated FROM_EMAIL to noreply@organitrafficboost.com"
cat .env

# Restart email-api
pm2 restart email-api
pm2 logs email-api --lines 10
