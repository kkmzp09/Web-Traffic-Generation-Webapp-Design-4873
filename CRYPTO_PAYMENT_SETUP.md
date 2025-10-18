# Crypto Payment Setup Guide

## How to Add Your Cryptocurrency Wallet Addresses

### Step 1: Get Your Wallet Addresses

You need wallet addresses for the cryptocurrencies you want to accept:

1. **Bitcoin (BTC)** - Get from any Bitcoin wallet (Coinbase, Binance, Trust Wallet, etc.)
2. **Ethereum (ETH)** - Get from any Ethereum wallet (MetaMask, Coinbase, Binance, etc.)
3. **USDT (Tether)** - Usually the same address as ETH (ERC-20 network)

### Step 2: Generate QR Codes for Each Wallet

**Option A: Use Online QR Generator**
1. Go to https://www.the-qrcode-generator.com/
2. Select "Text" type
3. Paste your wallet address
4. Download the QR code image
5. Save as:
   - `public/images/crypto-qr-btc.png` (Bitcoin)
   - `public/images/crypto-qr-eth.png` (Ethereum)
   - `public/images/crypto-qr-usdt.png` (USDT)

**Option B: Use Your Wallet App**
1. Open your crypto wallet app
2. Go to "Receive" section
3. Select the cryptocurrency
4. Screenshot or save the QR code
5. Save to the paths mentioned above

### Step 3: Update Wallet Addresses

Open `src/pages/CryptoPaymentPage.jsx` and update lines 56-82:

```javascript
const cryptoWallets = {
  bitcoin: {
    name: 'Bitcoin (BTC)',
    address: 'YOUR_ACTUAL_BTC_ADDRESS_HERE', // ← Update this
    qrCode: '/images/crypto-qr-btc.png',
    icon: SiBitcoin,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    network: 'Bitcoin Network',
    price: currentPlan.priceBTC
  },
  ethereum: {
    name: 'Ethereum (ETH)',
    address: 'YOUR_ACTUAL_ETH_ADDRESS_HERE', // ← Update this
    qrCode: '/images/crypto-qr-eth.png',
    icon: SiEthereum,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    network: 'Ethereum Network (ERC-20)',
    price: currentPlan.priceETH
  },
  usdt: {
    name: 'USDT (Tether)',
    address: 'YOUR_ACTUAL_USDT_ADDRESS_HERE', // ← Update this (usually same as ETH)
    qrCode: '/images/crypto-qr-usdt.png',
    icon: () => <span className="font-bold text-2xl">₮</span>,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    network: 'Ethereum Network (ERC-20)',
    price: currentPlan.priceUSDT
  }
};
```

### Step 4: Update Crypto Prices

The prices are calculated automatically, but you may want to adjust them:

**Current Pricing (lines 21-50):**
```javascript
starter: {
  priceINR: 50,
  priceUSD: 0.60,
  priceBTC: 0.000009,  // ← Adjust based on current BTC price
  priceETH: 0.00024,   // ← Adjust based on current ETH price
  priceUSDT: 0.60,     // ← Usually same as USD
},
professional: {
  priceINR: 100,
  priceUSD: 1.20,
  priceBTC: 0.000018,  // ← Adjust based on current BTC price
  priceETH: 0.00048,   // ← Adjust based on current ETH price
  priceUSDT: 1.20,     // ← Usually same as USD
}
```

**How to Calculate:**
- **BTC:** $1.20 ÷ Current BTC Price (e.g., $1.20 ÷ $65,000 = 0.0000185 BTC)
- **ETH:** $1.20 ÷ Current ETH Price (e.g., $1.20 ÷ $2,500 = 0.00048 ETH)
- **USDT:** Same as USD (1 USDT = 1 USD)

### Step 5: How the Crypto Payment Flow Works

1. **User selects a plan** ($50 or $100)
2. **Clicks "Pay with Crypto"** → Redirected to `/crypto-payment`
3. **Selects cryptocurrency** (BTC, ETH, or USDT)
4. **Sees wallet address & QR code**
5. **Sends exact amount** from their wallet
6. **Uploads transaction screenshot**
7. **Enters transaction hash** (TxID)
8. **Submits for verification**
9. **You verify on blockchain** and activate subscription

### Step 6: Verifying Crypto Payments

**For Bitcoin:**
1. Go to https://www.blockchain.com/explorer
2. Enter the transaction hash
3. Verify amount and recipient address match
4. Check confirmations (wait for 3+ confirmations)

**For Ethereum/USDT:**
1. Go to https://etherscan.io/
2. Enter the transaction hash
3. Verify amount and recipient address match
4. Check status (should be "Success")

### Step 7: Backend Integration (Required)

You'll need to create backend APIs similar to UPI payment:

```javascript
// Submit crypto payment proof
POST /api/crypto-payments/submit
Body: {
  userId,
  planType,
  cryptocurrency, // 'bitcoin', 'ethereum', 'usdt'
  amount,
  transactionHash,
  screenshot (file)
}

// Verify transaction on blockchain
POST /api/crypto-payments/verify/:paymentId
Body: {
  status: 'verified' | 'rejected',
  confirmations: number
}

// Get payment status
GET /api/crypto-payments/status/:userId
```

### Step 8: Database Schema

```sql
CREATE TABLE crypto_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  plan_type VARCHAR(50),
  cryptocurrency VARCHAR(20), -- 'bitcoin', 'ethereum', 'usdt'
  amount DECIMAL(18,8),
  transaction_hash VARCHAR(100),
  wallet_address VARCHAR(100),
  screenshot_url VARCHAR(500),
  status ENUM('pending', 'verified', 'rejected'),
  confirmations INT DEFAULT 0,
  submitted_at TIMESTAMP,
  verified_at TIMESTAMP
);
```

### Step 9: Security Best Practices

⚠️ **Important Security Measures:**

1. **Use Separate Wallets:**
   - Don't use your personal wallet
   - Create dedicated business wallets
   - Use hardware wallets for large amounts

2. **Verify Transactions:**
   - Always check on blockchain explorer
   - Wait for sufficient confirmations (BTC: 3+, ETH: 12+)
   - Verify exact amount and address

3. **Protect Private Keys:**
   - NEVER share private keys
   - NEVER store private keys in code
   - Use secure key management

4. **Monitor for Scams:**
   - Check for fake transaction screenshots
   - Verify transaction hash on blockchain
   - Watch for photoshopped images

### Step 10: Pricing Strategy

**Option A: Fixed Crypto Prices (Recommended)**
- Set prices in crypto and don't change frequently
- Simpler for users
- You absorb price volatility

**Option B: Dynamic Pricing**
- Use crypto price API (CoinGecko, CoinMarketCap)
- Update prices every hour/day
- More accurate but complex

**Example API Integration:**
```javascript
// Fetch current crypto prices
const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
const prices = await response.json();

const btcPrice = prices.bitcoin.usd;
const ethPrice = prices.ethereum.usd;
```

### Step 11: Tax & Compliance

📋 **Important Legal Considerations:**

1. **Tax Reporting:**
   - Keep records of all crypto transactions
   - Report crypto income to tax authorities
   - Consult with a tax professional

2. **KYC/AML:**
   - Consider implementing KYC for large transactions
   - Monitor for suspicious activity
   - Comply with local regulations

3. **Terms of Service:**
   - Clearly state crypto payment terms
   - Explain refund policy for crypto
   - Mention price volatility risks

### Step 12: Testing

**Test the flow:**
1. Start dev server: `npm run dev`
2. Go to homepage
3. Click "Pay with Crypto" on any plan
4. Select a cryptocurrency
5. Verify your wallet address displays correctly
6. Test the upload functionality

**Test with small amounts first!**

### Step 13: Production Checklist

- [ ] Add your actual wallet addresses
- [ ] Upload QR code images
- [ ] Update crypto prices
- [ ] Test with small transactions
- [ ] Create backend API for submissions
- [ ] Set up blockchain verification
- [ ] Create admin panel
- [ ] Set up email notifications
- [ ] Add terms and conditions
- [ ] Implement refund policy
- [ ] Test end-to-end flow
- [ ] Monitor first few transactions closely

### Step 14: Advantages of Crypto Payments

✅ **Benefits:**
- Global payments (no borders)
- Lower transaction fees
- Fast settlement
- No chargebacks
- Pseudonymous transactions
- Growing user base

⚠️ **Challenges:**
- Price volatility
- Technical complexity
- Longer verification time
- Irreversible transactions
- Regulatory uncertainty

### Step 15: Alternative: Use Payment Processors

If manual verification is too complex, consider:

1. **Coinbase Commerce** - Easy integration, handles verification
2. **BTCPay Server** - Self-hosted, open-source
3. **NOWPayments** - Multiple cryptocurrencies
4. **CoinGate** - Automatic conversion to fiat

These services handle blockchain verification automatically.

---

## Quick Start Commands

```bash
# Create images directory
mkdir public/images

# Copy your QR codes (replace with your actual file names)
copy C:\path\to\your\btc-qr.png public\images\crypto-qr-btc.png
copy C:\path\to\your\eth-qr.png public\images\crypto-qr-eth.png
copy C:\path\to\your\usdt-qr.png public\images\crypto-qr-usdt.png

# Test the app
npm run dev
```

---

Need help? Contact your developer or refer to the crypto payment page code comments.
