#!/bin/bash
cd /var/www/auth-api

# Backup current
cp server-auth.js server-auth.js.backup-before-fix

# Comment out the ensureTables call so it doesn't crash
sed -i 's/ensureTables().then/\/\/ ensureTables().then/g' server-auth.js
sed -i 's/}).catch(err/\/\/ }).catch(err/g' server-auth.js

# Add direct app.listen instead
cat >> server-auth.js << 'EOF'

// Start server directly (tables already exist in Neon)
app.listen(PORT, () => {
  console.log(`Auth API listening on ${PORT}`);
  console.log(`Email API: ${process.env.EMAIL_API_URL || 'https://api.organitrafficboost.com'}`);
});
EOF

echo "✅ Fixed auth-api to skip table creation"

# Restart
pm2 restart auth-api
sleep 3
pm2 logs auth-api --lines 15
