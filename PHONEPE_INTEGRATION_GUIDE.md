# PhonePe Payment Integration Guide

## ✅ Integration Status: COMPLETE

### Current Configuration
- **Environment:** TEST MODE (Sandbox)
- **Client ID:** `TEST-M23NNG4JA354R_25110`
- **API Base URL:** `https://api-preprod.phonepe.com/apis/pg-sandbox`
- **Status:** ✅ WORKING - Payment page opens successfully

---

## 🎯 What's Implemented

### 1. ✅ Payment Initiation
- **Endpoint:** `POST /api/payment/phonepe/initiate`
- **Features:**
  - OAuth token generation
  - Payment request creation
  - Redirect URL generation
  - Database payment record creation
  - Support for both logged-in users and guests

### 2. ✅ Payment Callback Handler
- **Endpoint:** `POST /api/payment/phonepe/callback`
- **Features:**
  - Webhook from PhonePe
  - Payment status verification with PhonePe API
  - Database status update
  - Automatic subscription activation on success
  - Handles COMPLETED, FAILED, and PENDING states

### 3. ✅ Payment Status Verification
- **Endpoint:** `GET /api/payment/phonepe/status/:transactionId`
- **Features:**
  - Check payment status from database
  - Auto-verify pending payments with PhonePe API
  - Update status if changed
  - Activate subscription if payment completed

### 4. ✅ User Payment History
- **Endpoint:** `GET /api/payment/phonepe/user-payments/:userId`
- **Features:**
  - Get all payments for a user
  - Ordered by creation date (newest first)

---

## 🔄 Switching Between Test and Production

### Currently in TEST MODE

To switch to **PRODUCTION MODE**, run:

```bash
ssh root@67.217.60.57 bash /root/relay/switch-to-production.sh
ssh root@67.217.60.57 pm2 restart relay-api --update-env
```

### Production Credentials
- **Client ID:** `SU2511041740265064774398`
- **Client Secret:** `6eb5396c-8c06-422e-8722-029679230caf`
- **Client Version:** `1`
- **API Base URL:** `https://api.phonepe.com/apis/pg-sandbox`

### ⚠️ Before Going to Production

1. **Verify with PhonePe Support:**
   - Confirm production credentials are fully activated
   - Test OAuth endpoint manually:
     ```bash
     curl --location 'https://api.phonepe.com/apis/pg-sandbox/v1/oauth/token' \
       --header 'Content-Type: application/x-www-form-urlencoded' \
       --data-urlencode 'client_id=SU2511041740265064774398' \
       --data-urlencode 'client_version=1' \
       --data-urlencode 'client_secret=6eb5396c-8c06-422e-8722-029679230caf' \
       --data-urlencode 'grant_type=client_credentials'
     ```
   - Should return `200 OK` with access token (not 401 or "Api Mapping Not Found")

2. **Test Production Flow:**
   - Make a small test payment (₹1-10)
   - Verify payment completes successfully
   - Check subscription activation
   - Verify callback webhook works

3. **Monitor Logs:**
   ```bash
   ssh root@67.217.60.57 pm2 logs relay-api --lines 100
   ```

---

## 📋 API Endpoints Summary

### Payment Initiation
```javascript
POST /api/payment/phonepe/initiate
Body: {
  userId: "uuid",           // Optional for guests
  planType: "starter",      // starter, professional, business
  amount: 499,              // In rupees
  email: "user@example.com",
  name: "User Name",
  phone: "9740065500"
}

Response: {
  success: true,
  transactionId: "MTTXN...",
  paymentUrl: "https://mercury-uat.phonepe.com/...",
  orderId: "OMO...",
  message: "Payment initiated successfully"
}
```

### Payment Callback (Webhook)
```javascript
POST /api/payment/phonepe/callback
Body: {
  merchantOrderId: "MTTXN..."
}

Response: {
  success: true,
  state: "COMPLETED" | "FAILED" | "PENDING"
}
```

### Check Payment Status
```javascript
GET /api/payment/phonepe/status/:transactionId

Response: {
  success: true,
  payment: {
    id: "uuid",
    transaction_id: "MTTXN...",
    status: "completed" | "pending" | "failed",
    amount: 499,
    plan_type: "starter",
    created_at: "2025-11-05T...",
    completed_at: "2025-11-05T...",
    phonepe_response: {...}
  }
}
```

### User Payment History
```javascript
GET /api/payment/phonepe/user-payments/:userId

Response: {
  success: true,
  payments: [...]
}
```

---

## 🗄️ Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  merchant_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'phonepe',
  phonepe_response JSONB,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id),
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Configuration Files

### Backend Location
- **File:** `/root/relay/phonepe-payment-api.js`
- **PM2 Process:** `relay-api`
- **Server:** `67.217.60.57`

### Environment Variables (.env)
```bash
# PhonePe Payment Gateway
PHONEPE_CLIENT_ID=TEST-M23NNG4JA354R_25110
PHONEPE_CLIENT_SECRET=MjFkYjAwYWEtOTM5ZC00MDkxLTlhOGQtZGVjNzdlMTI5NDAy
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=test
PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success
PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback
```

---

## 🚀 Deployment Commands

### Update Backend Code
```bash
# From local machine
scp phonepe-payment-api-new.js root@67.217.60.57:/root/relay/phonepe-payment-api.js
ssh root@67.217.60.57 pm2 restart relay-api
```

### Switch to Production
```bash
ssh root@67.217.60.57 bash /root/relay/switch-to-production.sh
ssh root@67.217.60.57 pm2 restart relay-api --update-env
```

### Check Logs
```bash
ssh root@67.217.60.57 pm2 logs relay-api --lines 50
```

### Check Environment
```bash
ssh root@67.217.60.57 "cat /root/relay/.env | grep PHONEPE"
```

---

## 🧪 Testing

### Test Payment Flow
1. Go to: https://organitrafficboost.com/pricing
2. Click "Get Started" on any plan
3. Enter phone number: `9740065500`
4. Click "Pay via PhonePe"
5. PhonePe checkout page should open
6. Complete payment (test mode uses test UPI/cards)
7. Verify payment status updates
8. Check subscription activation

### Test Credentials (Sandbox)
- **Test UPI IDs:** Provided by PhonePe in test mode
- **Test Cards:** Provided by PhonePe in test mode
- All test payments are simulated and no real money is charged

---

## 📞 Support

### PhonePe Support
- **Dashboard:** https://business.phonepe.com/
- **Documentation:** https://developer.phonepe.com/
- **Contact:** support@phonepe.com

### Common Issues

#### 1. "Api Mapping Not Found" Error
- **Cause:** Credentials not activated by PhonePe
- **Solution:** Contact PhonePe support to activate API access

#### 2. "401 Unauthorized" Error
- **Cause:** Wrong Client ID or Client Secret
- **Solution:** Verify credentials in PhonePe dashboard

#### 3. Payment Status Not Updating
- **Cause:** Callback webhook not configured
- **Solution:** Verify callback URL in PhonePe dashboard

---

## ✅ Checklist for Production

- [ ] PhonePe production credentials activated
- [ ] Test OAuth endpoint manually
- [ ] Test small payment (₹1-10)
- [ ] Verify callback webhook works
- [ ] Check subscription activation
- [ ] Monitor logs for errors
- [ ] Test payment failure scenarios
- [ ] Verify refund process (if needed)
- [ ] Update frontend to production mode
- [ ] Inform users about payment options

---

## 🎉 Success!

PhonePe payment integration is complete and working in TEST MODE. Follow the checklist above before switching to PRODUCTION.

**Last Updated:** November 5, 2025
**Status:** ✅ TEST MODE WORKING
**Next Step:** Contact PhonePe to activate production credentials
