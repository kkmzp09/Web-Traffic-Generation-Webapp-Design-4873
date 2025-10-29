#!/bin/bash
cd /root/relay

echo "Adding DataForSEO credentials to .env..."

# Decode the Base64 credentials
DECODED=$(echo "a2tAam9ibWFrZXJzLmluOmQwZmZhN2RhMTMyZTI4MTk=" | base64 -d)
LOGIN=$(echo $DECODED | cut -d: -f1)
PASSWORD=$(echo $DECODED | cut -d: -f2)

echo "Login: $LOGIN"
echo "Password: ${PASSWORD:0:5}***"

# Backup .env
cp .env .env.backup-dataforseo

# Remove old DataForSEO entries if they exist
sed -i '/DATAFORSEO_LOGIN/d' .env
sed -i '/DATAFORSEO_PASSWORD/d' .env

# Add new credentials
echo "" >> .env
echo "# DataForSEO API Credentials" >> .env
echo "DATAFORSEO_LOGIN=$LOGIN" >> .env
echo "DATAFORSEO_PASSWORD=$PASSWORD" >> .env

echo ""
echo "✅ Credentials added to .env"
echo ""
echo "Verifying..."
grep "DATAFORSEO" .env | sed 's/=.*/=***/'

echo ""
echo "Restarting API with new credentials..."
pm2 restart relay-api --update-env

sleep 2
echo ""
echo "Checking logs..."
pm2 logs relay-api --lines 10 --nostream | grep -i dataforseo
