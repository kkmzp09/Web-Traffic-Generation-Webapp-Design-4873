# PhonePe Payment Gateway Setup Guide

## ✅ Status: Routes Registered Successfully!

Your PhonePe integration is now connected to the backend server.

---

## 🔧 Step 1: Create Database Tables

Run this SQL in your **Neon PostgreSQL** database:

```sql
-- Create payments table for PhonePe transactions
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  merchant_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  phonepe_transaction_id VARCHAR(255),
  plan_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'phonepe',
  phonepe_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_transaction_id ON payments(merchant_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add payment_id to subscriptions table if not exists
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id);

COMMENT ON TABLE payments IS 'Stores PhonePe payment transactions';
COMMENT ON COLUMN payments.transaction_id IS 'Internal transaction ID';
COMMENT ON COLUMN payments.merchant_transaction_id IS 'PhonePe merchant transaction ID';
COMMENT ON COLUMN payments.phonepe_transaction_id IS 'PhonePe transaction ID from callback';
COMMENT ON COLUMN payments.phonepe_response IS 'Full PhonePe API response';
```

---

## 🔑 Step 2: Configure Environment Variables

Add these to your backend `.env` file (on VPS at `/root/relay/.env`):

```bash
# PhonePe Payment Gateway Configuration
# Get these from: https://business.phonepe.com/

# Merchant ID from PhonePe Dashboard
PHONEPE_MERCHANT_ID=your_merchant_id_here

# Salt Key from PhonePe Dashboard
PHONEPE_SALT_KEY=your_salt_key_here

# Salt Index (usually 1)
PHONEPE_SALT_INDEX=1

# Environment: 'sandbox' for testing, 'production' for live
PHONEPE_ENV=sandbox

# Redirect URL (where user lands after payment)
PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success

# Callback URL (PhonePe webhook - must be publicly accessible)
PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback
```

---

## 📋 Step 3: Get PhonePe Credentials

### For Testing (Sandbox):
1. Visit: https://developer.phonepe.com/
2. Sign up for developer account
3. Get **Test Merchant ID** and **Salt Key**
4. Use `PHONEPE_ENV=sandbox`

### For Production:
1. Visit: https://business.phonepe.com/
2. Complete merchant onboarding
3. Get **Production Merchant ID** and **Salt Key**
4. Use `PHONEPE_ENV=production`

---

## 🚀 Step 4: Deploy Backend Changes

Since you modified `server.js`, you need to deploy to your VPS:

```bash
# 1. Upload the updated server.js to VPS
scp backend/server.js root@67.217.60.57:/root/relay/

# 2. SSH into VPS
ssh root@67.217.60.57

# 3. Restart PM2 process
pm2 restart relay-api

# 4. Check logs
pm2 logs relay-api
```

---

## 🧪 Step 5: Test the Integration

### Test Endpoints:

1. **Health Check**
   ```bash
   curl https://api.organitrafficboost.com/health
   ```

2. **Initiate Payment** (Test)
   ```bash
   curl -X POST https://api.organitrafficboost.com/api/payment/phonepe/initiate \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test-user-id",
       "planType": "starter",
       "amount": 499,
       "email": "test@example.com",
       "name": "Test User",
       "phone": "9876543210"
     }'
   ```

3. **Check Payment Status**
   ```bash
   curl https://api.organitrafficboost.com/api/payment/phonepe/status/TXN123456
   ```

---

## 📡 API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/phonepe/initiate` | POST | Initiate new payment |
| `/api/payment/phonepe/callback` | POST | PhonePe webhook callback |
| `/api/payment/phonepe/status/:transactionId` | GET | Check payment status |
| `/api/payment/phonepe/user-payments/:userId` | GET | Get user payment history |

---

## 🎨 Frontend Integration

Your frontend is already set up! The components are ready:

- **Component**: `src/components/PhonePeCheckout.jsx`
- **Success Page**: `src/pages/PaymentSuccess.jsx`

### Usage Example:
```jsx
import PhonePeCheckout from '../components/PhonePeCheckout';

function PricingPage() {
  return (
    <PhonePeCheckout 
      planType="starter"
      onSuccess={() => console.log('Payment successful!')}
      onCancel={() => console.log('Payment cancelled')}
    />
  );
}
```

---

## 🔐 Security Notes

1. **Never commit** `.env` file with real credentials
2. **Callback URL** must be publicly accessible (HTTPS required)
3. **Checksum verification** is implemented for security
4. **SSL/TLS** is required for production

---

## 📊 Payment Flow

```
User clicks "Pay" 
  → Frontend calls /initiate
    → Backend creates payment record
      → PhonePe returns payment URL
        → User redirected to PhonePe
          → User completes payment
            → PhonePe calls /callback webhook
              → Backend updates payment status
                → Backend activates subscription
                  → User redirected to /payment-success
```

---

## 🐛 Troubleshooting

### Issue: "Routes not found"
- **Solution**: Make sure you deployed the updated `server.js` and restarted PM2

### Issue: "Invalid checksum"
- **Solution**: Verify `PHONEPE_SALT_KEY` and `PHONEPE_SALT_INDEX` are correct

### Issue: "Callback not received"
- **Solution**: Ensure callback URL is publicly accessible (not localhost)

### Issue: "Payment stuck in pending"
- **Solution**: Check PhonePe dashboard and verify webhook is configured

---

## 📞 Support

- **PhonePe Docs**: https://developer.phonepe.com/payment-gateway
- **PhonePe Support**: https://www.phonepe.com/contact-us/
- **Test Postman Collection**: https://www.postman.com/phonepe-pg-integrations-online

---

## ✅ Checklist

- [x] Routes registered in server.js
- [ ] Database tables created in Neon
- [ ] Environment variables configured
- [ ] Backend deployed to VPS
- [ ] PM2 restarted
- [ ] PhonePe credentials obtained
- [ ] Test payment completed
- [ ] Production credentials added (when ready)

---

**Next Steps:**
1. Create the database tables in Neon
2. Add environment variables to VPS
3. Deploy backend changes
4. Test with sandbox credentials
5. Switch to production when ready
