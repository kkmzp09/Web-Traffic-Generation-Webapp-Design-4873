# ✅ PhonePe Integration - Final Setup Steps

## 🎉 What's Already Done:

✅ **Backend files uploaded** to VPS (`/root/relay/`)
✅ **PhonePe routes registered** in server.js
✅ **PM2 restarted** - Server running successfully
✅ **Routes confirmed** - "✅ PhonePe Payment API routes initialized" in logs

---

## 📋 Remaining Steps (You Need to Do):

### **Step 1: Create Database Tables in Neon**

Go to your **Neon PostgreSQL Dashboard** and run this SQL:

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
```

---

### **Step 2: Add PhonePe Environment Variables**

SSH into your VPS and edit the `.env` file:

```bash
ssh root@67.217.60.57
nano /root/relay/.env
```

Add these lines at the end:

```bash
# PhonePe Payment Gateway Configuration
PHONEPE_MERCHANT_ID=your_merchant_id_here
PHONEPE_SALT_KEY=your_salt_key_here
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=sandbox
PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success
PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback
```

Save and exit (Ctrl+X, then Y, then Enter)

---

### **Step 3: Get PhonePe Credentials**

#### For Testing (Sandbox):
1. Go to: https://developer.phonepe.com/
2. Sign up for a developer account
3. Get your **Test Merchant ID** and **Salt Key**
4. Use `PHONEPE_ENV=sandbox`

#### For Production (Live Payments):
1. Go to: https://business.phonepe.com/
2. Complete merchant onboarding (KYC required)
3. Get your **Production Merchant ID** and **Salt Key**
4. Use `PHONEPE_ENV=production`

---

### **Step 4: Restart PM2 with Updated Environment**

After adding environment variables:

```bash
ssh root@67.217.60.57
pm2 restart relay-api --update-env
pm2 logs relay-api --lines 20
```

---

## 🧪 Test the Integration

### Test 1: Check if endpoint is accessible

```bash
curl https://api.organitrafficboost.com/api/payment/phonepe/status/test123
```

Expected response: `{"success":false,"error":"Payment not found"}`

### Test 2: Initiate a test payment (after adding credentials)

```bash
curl -X POST https://api.organitrafficboost.com/api/payment/phonepe/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-uuid",
    "planType": "starter",
    "amount": 499,
    "email": "test@example.com",
    "name": "Test User",
    "phone": "9876543210"
  }'
```

---

## 📡 Available API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payment/phonepe/initiate` | POST | Initiate new payment |
| `/api/payment/phonepe/callback` | POST | PhonePe webhook (automatic) |
| `/api/payment/phonepe/status/:transactionId` | GET | Check payment status |
| `/api/payment/phonepe/user-payments/:userId` | GET | Get user payment history |

---

## 🎨 Frontend Usage

Your frontend components are already created and ready to use:

### In your pricing or checkout page:

```jsx
import PhonePeCheckout from '../components/PhonePeCheckout';

function PricingPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const handleSelectPlan = (planType) => {
    setSelectedPlan(planType);
    setShowCheckout(true);
  };

  return (
    <div>
      {showCheckout ? (
        <PhonePeCheckout 
          planType={selectedPlan}
          onSuccess={() => {
            console.log('Payment successful!');
            // Redirect or show success message
          }}
          onCancel={() => setShowCheckout(false)}
        />
      ) : (
        <div>
          <button onClick={() => handleSelectPlan('starter')}>
            Buy Starter Plan
          </button>
          <button onClick={() => handleSelectPlan('professional')}>
            Buy Professional Plan
          </button>
          <button onClick={() => handleSelectPlan('business')}>
            Buy Business Plan
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Payment Flow

```
1. User selects plan and clicks "Pay"
2. Frontend calls /api/payment/phonepe/initiate
3. Backend creates payment record in database
4. Backend calls PhonePe API
5. PhonePe returns payment URL
6. User redirected to PhonePe payment page
7. User completes payment on PhonePe
8. PhonePe calls /api/payment/phonepe/callback webhook
9. Backend verifies payment and updates status
10. Backend activates subscription
11. User redirected to /payment-success page
```

---

## 📝 Important Notes

1. **Callback URL must be publicly accessible** - PhonePe needs to reach it
2. **HTTPS is required** for production
3. **Checksum verification** is automatic for security
4. **Test with sandbox first** before going live
5. **Keep your Salt Key secret** - never commit to git

---

## 🐛 Troubleshooting

### "Payment not found" error
- Make sure database tables are created
- Check if DATABASE_URL is set correctly

### "Invalid checksum" error
- Verify PHONEPE_SALT_KEY is correct
- Check PHONEPE_SALT_INDEX (usually 1)

### Callback not received
- Ensure callback URL is publicly accessible
- Check PhonePe dashboard webhook settings
- Verify HTTPS is working

### Server errors
- Check PM2 logs: `pm2 logs relay-api`
- Verify all environment variables are set
- Restart with: `pm2 restart relay-api --update-env`

---

## 📚 Resources

- **PhonePe Docs**: https://developer.phonepe.com/payment-gateway
- **PhonePe Business**: https://business.phonepe.com/
- **Support**: https://www.phonepe.com/contact-us/
- **Postman Collection**: https://www.postman.com/phonepe-pg-integrations-online

---

## ✅ Deployment Checklist

- [x] Backend files uploaded to VPS
- [x] PhonePe routes registered in server.js
- [x] PM2 restarted successfully
- [ ] Database tables created in Neon
- [ ] Environment variables added to VPS
- [ ] PhonePe credentials obtained
- [ ] PM2 restarted with --update-env
- [ ] Test payment completed
- [ ] Production credentials added (when ready)

---

**🎉 You're almost done! Just complete steps 1-4 above and you'll be ready to accept payments!**
