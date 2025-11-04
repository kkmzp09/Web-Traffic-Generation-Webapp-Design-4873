#!/bin/bash

# Add PhonePe routes to server.js

cat >> /root/relay/server.js << 'EOF'

// Setup PhonePe Payment API routes
(async () => {
  const phonepePaymentRoutes = require('./phonepe-payment-api.js');
  app.use('/api/payment/phonepe', phonepePaymentRoutes);
  console.log('✅ PhonePe Payment API routes initialized');
})();
EOF

echo "✅ PhonePe routes added to server.js"
