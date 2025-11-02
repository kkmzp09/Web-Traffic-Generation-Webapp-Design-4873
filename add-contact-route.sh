#!/bin/bash
# Add contact form API route to server.js

cd /root/relay

# Add the contact form route before the Checkout API section
sed -i '/Setup Checkout API routes/i\
// Setup Contact Form API routes\
(async () => {\
  const contactFormAPI = require("./contact-form-api.js");\
  app.use("/api/contact", contactFormAPI);\
  console.log("✅ Contact Form API routes initialized");\
})();\
\
' server.js

echo "✅ Contact Form API route added to server.js"
