# 🎯 Keyword Tracker Implementation

Complete keyword ranking tracker using DataForSEO APIs with Neon PostgreSQL.

## ✅ What's Implemented

### **1. Database Schema** (`keyword-tracker-schema.sql`)
- ✅ `tracked_keywords` - Main tracking table
- ✅ `keyword_ranking_history` - Historical ranking data
- ✅ `keyword_metrics` - Search volume, CPC, competition data
- ✅ Indexes for performance
- ✅ Auto-update triggers

### **2. DataForSEO Services** (`dataforseo-keywords-service.js`)

#### **Keywords Data API:**
- ✅ `getKeywordMetrics()` - Search volume, CPC, competition
- ✅ `getKeywordIdeas()` - Related keyword suggestions
- ✅ Uses Google Ads Keywords Data API

#### **SERP API:**
- ✅ `getKeywordRanking()` - Get actual ranking position
- ✅ `getBatchKeywordRankings()` - Batch ranking checks
- ✅ Checks top 100 Google results
- ✅ Finds domain position automatically

#### **Utilities:**
- ✅ `getLocations()` - Get available tracking locations

### **3. Backend API** (`keyword-tracker-api.js`)

All endpoints use Neon PostgreSQL via `pg` Pool:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seo/tracked-keywords` | GET | Get all tracked keywords for user |
| `/api/seo/track-keyword` | POST | Add new keyword to track |
| `/api/seo/refresh-keyword/:id` | POST | Refresh ranking for keyword |
| `/api/seo/tracked-keyword/:id` | DELETE | Stop tracking keyword |
| `/api/seo/keyword-history/:id` | GET | Get ranking history |
| `/api/seo/locations` | GET | Get available locations |
| `/api/seo/keyword-ideas` | POST | Get keyword suggestions |

### **4. Frontend** (`src/components/KeywordTracker.jsx`)
- ✅ Already exists and ready to use
- ✅ Beautiful UI with all features
- ✅ Add, refresh, delete keywords
- ✅ Shows rank changes with trends

---

## 📊 DataForSEO APIs Used

### **1. Keywords Data API**
```
POST /v3/keywords_data/google_ads/search_volume/live
```
- **Purpose:** Get search volume, CPC, competition
- **Cost:** ~$0.001 per keyword
- **Returns:** Monthly search volume, competition level, CPC

### **2. SERP API**
```
POST /v3/serp/google/organic/live/advanced
```
- **Purpose:** Get actual ranking position
- **Cost:** ~$0.003 per keyword
- **Returns:** Rank position (1-100), ranked URL

---

## 💰 Cost Breakdown

| Action | API Used | Cost per Call |
|--------|----------|---------------|
| Add keyword | Keywords Data + SERP | ~$0.004 |
| Refresh ranking | SERP only | ~$0.003 |
| Get keyword ideas | Keywords Data | ~$0.001 |

**Example Monthly Costs:**
- **100 keywords checked daily:** ~$9/month
- **500 keywords checked daily:** ~$45/month
- **1000 keywords checked daily:** ~$90/month

---

## 🚀 Deployment Steps

### **Step 1: Upload Files**
```bash
scp server-files/keyword-tracker-schema.sql root@67.217.60.57:/root/relay/
scp server-files/dataforseo-keywords-service.js root@67.217.60.57:/root/relay/
scp server-files/keyword-tracker-api.js root@67.217.60.57:/root/relay/
scp server-files/setup-keyword-tracker.sh root@67.217.60.57:/root/relay/
```

### **Step 2: Setup Database**
```bash
ssh root@67.217.60.57
cd /root/relay
chmod +x setup-keyword-tracker.sh
bash setup-keyword-tracker.sh
```

### **Step 3: Add Routes to server.js**
Add these lines to `/root/relay/server.js`:
```javascript
// Keyword Tracker API
const keywordTrackerAPI = require('./keyword-tracker-api');
app.use('/api/seo', keywordTrackerAPI);
console.log('✅ Keyword Tracker routes initialized');
```

### **Step 4: Restart API**
```bash
pm2 restart relay-api
```

### **Step 5: Test**
```bash
# Test locations endpoint
curl https://api.organitrafficboost.com/api/seo/locations

# Test tracking a keyword
curl -X POST https://api.organitrafficboost.com/api/seo/track-keyword \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-0000-0000-000000000000",
    "keyword": "seo tools",
    "domain": "example.com",
    "location": "United States"
  }'
```

---

## 🎯 Features

### **Automatic Tracking:**
- ✅ Search volume
- ✅ Current ranking position
- ✅ Rank changes (up/down)
- ✅ Best/worst rank ever
- ✅ CPC and competition
- ✅ Historical data

### **Smart Features:**
- ✅ Batch ranking checks (efficient)
- ✅ Automatic domain matching
- ✅ Location-specific tracking
- ✅ Daily auto-refresh (can be scheduled)
- ✅ Historical trend charts

---

## 📈 Database Schema

### **tracked_keywords**
```sql
- id (PRIMARY KEY)
- user_id (UUID)
- keyword (VARCHAR)
- domain (VARCHAR)
- location_code (INTEGER) -- DataForSEO location code
- location_name (VARCHAR)
- current_rank (INTEGER)
- previous_rank (INTEGER)
- search_volume (INTEGER)
- competition (DECIMAL)
- cpc (DECIMAL)
- best_rank (INTEGER)
- worst_rank (INTEGER)
- last_checked (TIMESTAMP)
- created_at (TIMESTAMP)
```

### **keyword_ranking_history**
```sql
- id (PRIMARY KEY)
- keyword_id (FOREIGN KEY)
- rank_position (INTEGER)
- search_volume (INTEGER)
- cpc (DECIMAL)
- url (VARCHAR) -- The URL that ranked
- checked_at (TIMESTAMP)
```

---

## 🔧 Configuration

### **Environment Variables**
Already configured in `.env`:
```
DATAFORSEO_LOGIN=kk@jobmakers.in
DATAFORSEO_PASSWORD=d0ffa7da132e2819
DATABASE_URL=<Neon PostgreSQL URL>
```

### **Default Settings**
- Location: United States (code: 2840)
- Language: English (en)
- Check frequency: Daily
- Depth: Top 100 results

---

## 🎨 Frontend Integration

The frontend (`KeywordTracker.jsx`) is already built and will work automatically once the backend is deployed. It includes:

- ✅ Add keyword form
- ✅ Keywords table with rankings
- ✅ Refresh button
- ✅ Delete button
- ✅ Rank change indicators (🔼🔽)
- ✅ Search volume display
- ✅ Last checked timestamp

---

## 📝 API Examples

### **Track a Keyword**
```javascript
POST /api/seo/track-keyword
{
  "userId": "user-uuid",
  "keyword": "best seo tools",
  "domain": "example.com",
  "location": "United States"
}
```

### **Refresh Ranking**
```javascript
POST /api/seo/refresh-keyword/123
```

### **Get Tracked Keywords**
```javascript
GET /api/seo/tracked-keywords?userId=user-uuid
```

---

## ✅ Ready to Deploy!

Run the deployment script:
```bash
cmd /c deploy-keyword-tracker.bat
```

Or deploy manually following the steps above.

---

## 🎉 After Deployment

1. Go to `https://organitrafficboost.com/keyword-tracker`
2. Add a keyword to track
3. Wait 10-20 seconds for DataForSEO to fetch data
4. See your ranking, search volume, and metrics!

**The Keyword Tracker is now fully functional!** 🚀
