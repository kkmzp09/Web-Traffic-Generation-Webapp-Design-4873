# UPI Payment Setup Guide

## How to Add Your UPI QR Code

### Step 1: Prepare Your QR Code Image

1. **Get your UPI QR code** from your payment app (Google Pay, PhonePe, Paytm, etc.)
2. **Save it as an image** (PNG or JPG format)
3. **Upload it to your project**:
   - Save it in: `public/images/upi-qr-code.png`
   - OR use an image hosting service (Imgur, Cloudinary, etc.)

### Step 2: Update the Payment Page

Open `src/pages/PaymentPage.jsx` and update these lines:

```javascript
// Line 38-39: Replace with your actual values
const upiQRCode = '/images/upi-qr-code.png'; // Path to your QR code image
const upiId = 'yourname@upi'; // Your actual UPI ID (e.g., 9876543210@paytm)
```

**Example:**
```javascript
const upiQRCode = '/images/upi-qr-code.png';
const upiId = '9876543210@paytm';
```

### Step 3: How the Payment Flow Works

1. **User selects a plan** on landing page ($50 or $100)
2. **Clicks "Get Started"** → Redirected to `/payment` page
3. **User sees your UPI QR code** and payment instructions
4. **User makes payment** via any UPI app
5. **User uploads screenshot** of successful payment
6. **User enters transaction ID** (12-digit UTR number)
7. **Submits for verification** → Payment goes to "pending" status
8. **You manually verify** the payment in your backend/admin panel
9. **Activate subscription** once verified

### Step 4: Backend Integration (Required)

You'll need to create a backend API to:

1. **Store payment submissions:**
   - User ID
   - Plan selected
   - Transaction ID
   - Screenshot URL
   - Payment amount
   - Status (pending/verified/rejected)
   - Timestamp

2. **Admin panel to verify payments:**
   - View all pending payments
   - Check screenshot and transaction ID
   - Verify in your UPI app
   - Approve or reject
   - Activate user subscription

### Step 5: Database Schema Example

```sql
CREATE TABLE payment_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  plan_type VARCHAR(50), -- 'starter' or 'professional'
  amount DECIMAL(10,2),
  transaction_id VARCHAR(50),
  screenshot_url VARCHAR(500),
  status ENUM('pending', 'verified', 'rejected'),
  submitted_at TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by INT
);

CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  plan_type VARCHAR(50),
  visits_remaining INT,
  start_date DATE,
  end_date DATE,
  status ENUM('active', 'expired', 'cancelled')
);
```

### Step 6: API Endpoints Needed

```javascript
// Submit payment proof
POST /api/payments/submit
Body: {
  userId, planType, amount, transactionId, screenshot (file)
}

// Get payment status
GET /api/payments/status/:userId

// Admin: Get pending payments
GET /api/admin/payments/pending

// Admin: Verify payment
POST /api/admin/payments/verify/:paymentId
Body: { status: 'verified' | 'rejected' }

// Check subscription status
GET /api/subscriptions/:userId
```

### Step 7: Update Support Email

In `PaymentPage.jsx` line 279, update:
```javascript
<p className="font-medium text-blue-600 mt-1">support@trafficgenpro.com</p>
```

Replace with your actual support email.

## Testing the Payment Flow

1. **Start dev server:** `npm run dev`
2. **Go to homepage:** http://localhost:5173
3. **Click "Get Started"** on any plan
4. **You'll see the payment page** with QR code
5. **Test the upload flow** with a sample screenshot

## Important Notes

⚠️ **Security Considerations:**
- Store screenshots securely (use cloud storage like AWS S3, Cloudinary)
- Validate file types and sizes
- Never expose user payment details publicly
- Use HTTPS in production
- Implement rate limiting on upload endpoint

⚠️ **Manual Verification:**
- Check transaction ID in your UPI app
- Verify amount matches the plan
- Check payment timestamp
- Confirm screenshot is genuine

⚠️ **User Experience:**
- Send email confirmation when payment is submitted
- Send email when payment is verified
- Send email if payment is rejected with reason
- Provide clear instructions for resubmission

## Production Checklist

- [ ] Add your actual UPI QR code image
- [ ] Update UPI ID
- [ ] Create backend API for payment submissions
- [ ] Set up file upload to cloud storage
- [ ] Create admin panel for verification
- [ ] Set up email notifications
- [ ] Test entire flow end-to-end
- [ ] Add payment verification within 24 hours SLA
- [ ] Create refund policy page
- [ ] Add terms and conditions

## Alternative: Automated Verification

If you want to automate verification, you can:
1. Use UPI payment gateway APIs (Razorpay, Cashfree, etc.)
2. Integrate with your bank's API
3. Use payment reconciliation services

But for manual QR code payments, manual verification is the standard approach.

---

Need help? Contact your developer or refer to the payment page code comments.
