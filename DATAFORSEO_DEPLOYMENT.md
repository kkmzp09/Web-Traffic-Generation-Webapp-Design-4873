# DataForSEO Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Get DataForSEO API Credentials

1. Sign up at https://dataforseo.com/
2. Add $10 credit to your account
3. Get your credentials:
   - Login: your-email@example.com
   - Password: your-api-key

---

### Step 2: Deploy to VPS

```bash
# SSH to your VPS
ssh root@your-vps-ip

# Navigate to relay API
cd ~/relay-api

# Install axios if not already installed
npm install axios

# Add environment variables
nano .env
```

Add these lines to `.env`:
```env
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=your-api-password
```

---

### Step 3: Upload Service Files

```bash
# Upload dataforseo-service.js
nano ~/relay-api/dataforseo-service.js
# Paste content from server-files/dataforseo-service.js

# Upload API endpoints
nano ~/relay-api/dataforseo-api-endpoints.js
# Paste content from server-files/dataforseo-api-endpoints.js
```

---

### Step 4: Update server.js

```bash
nano ~/relay-api/server.js
```

Add at the top:
```javascript
import { setupDataForSEORoutes } from './dataforseo-api-endpoints.js';
```

Add before `app.listen()`:
```javascript
// Setup DataForSEO routes
setupDataForSEORoutes(app);
```

---

### Step 5: Restart Services

```bash
pm2 restart relay-api
pm2 logs relay-api --lines 20
```

Look for:
```
✅ DataForSEO API routes registered
```

---

### Step 6: Test API

```bash
curl -X POST https://api.organitrafficboost.com/api/seo/domain-overview \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

Should return domain analytics data.

---

### Step 7: Add to Frontend Routes

Edit `src/App.jsx`:

```javascript
import DomainAnalytics from './components/DomainAnalytics';

// Add route
<Route path="/domain-analytics" element={<DomainAnalytics />} />
```

---

### Step 8: Add to Navigation

Edit your navigation component to add:

```javascript
<Link to="/domain-analytics">
  <FiBarChart2 /> Domain Analytics
</Link>
```

---

## 🧪 Testing

### Test Domain Overview
```bash
curl -X POST http://localhost:3001/api/seo/domain-overview \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","location":"United States"}'
```

### Test Ranked Keywords
```bash
curl -X POST http://localhost:3001/api/seo/ranked-keywords \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","limit":10}'
```

### Test Full Analytics
```bash
curl -X POST http://localhost:3001/api/seo/domain-analytics \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

---

## 💰 Cost Management

### Caching Strategy

Add caching to reduce API costs:

```javascript
// In dataforseo-service.js
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}
```

### Rate Limiting

Add rate limiting per user:

```javascript
const rateLimit = require('express-rate-limit');

const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many analytics requests, please try again later'
});

app.post('/api/seo/domain-analytics', analyticsLimiter, async (req, res) => {
  // ... handler
});
```

---

## 📊 Available Endpoints

| Endpoint | Method | Description | Cost |
|----------|--------|-------------|------|
| `/api/seo/domain-overview` | POST | Domain metrics | $0.02 |
| `/api/seo/ranked-keywords` | POST | Ranking keywords | $0.05 |
| `/api/seo/competitors` | POST | Competitor domains | $0.04 |
| `/api/seo/keyword-suggestions` | POST | Related keywords | $0.03 |
| `/api/seo/backlinks` | POST | Backlink summary | $0.03 |
| `/api/seo/domain-analytics` | POST | Full analytics | $0.15 |

---

## ✅ Verification Checklist

- [ ] DataForSEO account created
- [ ] API credentials added to .env
- [ ] Service files uploaded
- [ ] server.js updated
- [ ] relay-api restarted
- [ ] API endpoints tested
- [ ] Frontend component added
- [ ] Route added to App.jsx
- [ ] Navigation link added
- [ ] Caching implemented (optional)
- [ ] Rate limiting added (optional)

---

## 🎯 Next Steps

1. **Test with your domain**
2. **Integrate with SEO Traffic campaigns**
3. **Add keyword auto-selection**
4. **Create traffic potential calculator**
5. **Build ROI estimator**

---

**Your domain analytics feature is now live!** 🎉
