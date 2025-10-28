// Standalone test server for checkout API
const express = require('express');
const checkoutApi = require('./checkout-api');

const app = express();
app.use(express.json());

// Mount the checkout API
app.use('/api', checkoutApi);

const PORT = 3002;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on http://127.0.0.1:${PORT}`);
  console.log('Test with:');
  console.log(`curl -X POST http://localhost:${PORT}/api/validate-discount -H "Content-Type: application/json" -d '{"code":"FREE100","planType":"seo_professional"}'`);
});
