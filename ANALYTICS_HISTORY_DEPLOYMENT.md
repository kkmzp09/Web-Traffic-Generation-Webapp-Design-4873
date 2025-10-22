# Domain Analytics History - Deployment Guide

## 🎯 Feature Overview

This update adds **Analytics History** to the Domain Analytics feature, allowing users to:
- ✅ Save all domain analysis results automatically
- ✅ View past analyses without re-running API calls
- ✅ Track SEO changes over time
- ✅ Delete old analyses
- ✅ See analytics stats (total domains, total analyses, last analysis date)

---

## 📦 What's New

### Backend Changes
1. **Database Schema** (`server-files/domain-analytics-schema.sql`)
   - New `domain_analytics` table to store analysis results
   - Indexes for fast queries
   - View for latest analyses per domain

2. **Database Service** (`server-files/domain-analytics-db.js`)
   - Save analytics results
   - Retrieve user history
   - Get domain-specific history
   - Delete analyses
   - Get user stats

3. **API Endpoints** (`server-files/dataforseo-api-endpoints.js`)
   - Updated `/api/seo/domain-analytics` to save results
   - New `GET /api/seo/analytics-history` - Get user's analysis history
   - New `GET /api/seo/domain-history/:domain` - Get domain-specific history
   - New `GET /api/seo/analysis/:id` - Get single analysis
   - New `DELETE /api/seo/analysis/:id` - Delete analysis
   - New `GET /api/seo/analytics-stats` - Get user stats
   - New `GET /api/seo/latest-analysis/:domain` - Get latest analysis for domain

### Frontend Changes
1. **DomainAnalytics Component** (`src/components/DomainAnalytics.jsx`)
   - Stats cards showing total domains, analyses, and last analysis date
   - Recent analyses list (last 5)
   - Click to load saved analysis (no API call)
   - Delete button for each analysis
   - "Viewing Saved Analysis" badge with re-analyze button
   - "Analysis saved successfully" notification

---

## 🚀 Deployment Steps

### Step 1: Database Setup

**On your VPS, run the SQL schema:**

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Connect to PostgreSQL (Neon DB)
psql "your-neon-connection-string"

# Run the schema file
\i /root/relay/domain-analytics-schema.sql
```

**Or manually create the table:**

```sql
CREATE TABLE IF NOT EXISTS domain_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    total_keywords INTEGER DEFAULT 0,
    organic_traffic BIGINT DEFAULT 0,
    organic_cost DECIMAL(12, 2) DEFAULT 0,
    visibility_score INTEGER DEFAULT 0,
    top_keywords JSONB DEFAULT '[]'::jsonb,
    competitors JSONB DEFAULT '[]'::jsonb,
    backlinks JSONB DEFAULT '{}'::jsonb,
    raw_data JSONB DEFAULT '{}'::jsonb,
    location VARCHAR(100) DEFAULT 'United States',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_domain_analysis UNIQUE (user_id, domain, analyzed_at)
);

CREATE INDEX idx_domain_analytics_user_id ON domain_analytics(user_id);
CREATE INDEX idx_domain_analytics_domain ON domain_analytics(domain);
CREATE INDEX idx_domain_analytics_analyzed_at ON domain_analytics(analyzed_at DESC);
CREATE INDEX idx_domain_analytics_user_domain ON domain_analytics(user_id, domain);
```

### Step 2: Update Backend Files on VPS

**Copy new files to VPS:**

```bash
# From your local machine
scp server-files/domain-analytics-db.js root@your-vps:/root/relay/
scp server-files/domain-analytics-schema.sql root@your-vps:/root/relay/
scp server-files/dataforseo-api-endpoints.js root@your-vps:/root/relay/
```

### Step 3: Verify relay-api server.js

**Make sure your `/root/relay/server.js` imports the endpoints:**

```javascript
import { setupDataForSEORoutes } from './dataforseo-api-endpoints.js';

// After other middleware
setupDataForSEORoutes(app);
```

### Step 4: Restart Backend Service

```bash
# SSH into VPS
ssh root@your-vps-ip

# Restart relay-api
pm2 restart relay-api

# Check logs
pm2 logs relay-api --lines 50
```

**Look for these success messages:**
```
✅ DataForSEO API routes registered
✅ Analytics history routes registered
```

### Step 5: Deploy Frontend

**Push to GitHub (triggers Netlify deploy):**

```bash
# From your local machine
git push origin main
```

**Wait for Netlify to deploy** (2-3 minutes)

### Step 6: Verify Deployment

**Test on Production:**

1. Go to https://organitrafficboost.com
2. Login
3. Navigate to **Domain Analytics**
4. You should see:
   - Stats cards (0 domains, 0 analyses initially)
   - Search box
5. Analyze a domain (e.g., "amazon.com")
6. After analysis completes:
   - Green "Analysis saved successfully!" message should appear
   - Stats should update
   - Domain should appear in "Recent Analyses" section
7. Click on the saved analysis to load it
   - Blue "Viewing Saved Analysis" badge should appear
   - Click "Re-analyze" to fetch fresh data
8. Test delete button on a saved analysis

---

## 🔍 Troubleshooting

### Issue: "Analysis not saving"

**Check:**
1. Database table exists: `SELECT * FROM domain_analytics LIMIT 1;`
2. Backend logs: `pm2 logs relay-api`
3. Browser console for errors
4. User ID is being passed from frontend

**Fix:**
- Ensure `userId` is in the request body
- Check database connection string in `/root/relay/.env`

### Issue: "History not loading"

**Check:**
1. Network tab in browser - look for `/api/seo/analytics-history` call
2. Response status and data
3. Backend logs

**Fix:**
- Verify user is logged in (`user?.userId` exists)
- Check CORS settings in `/var/www/relay/.env`

### Issue: Database connection error

**Check:**
```bash
# Test database connection
psql "your-neon-connection-string" -c "SELECT 1;"
```

**Fix:**
- Update `DATABASE_URL` in `/root/relay/.env`
- Restart relay-api: `pm2 restart relay-api --update-env`

---

## 📊 Database Queries for Monitoring

**Check total analyses:**
```sql
SELECT COUNT(*) FROM domain_analytics;
```

**Check analyses per user:**
```sql
SELECT user_id, COUNT(*) as total_analyses, COUNT(DISTINCT domain) as unique_domains
FROM domain_analytics
GROUP BY user_id;
```

**Check recent analyses:**
```sql
SELECT domain, analyzed_at, total_keywords
FROM domain_analytics
ORDER BY analyzed_at DESC
LIMIT 10;
```

**Check storage size:**
```sql
SELECT pg_size_pretty(pg_total_relation_size('domain_analytics'));
```

---

## 🎉 Success Criteria

✅ Database table created successfully
✅ Backend endpoints responding correctly
✅ Frontend shows stats cards
✅ Analyses are being saved
✅ History loads on page load
✅ Can click to view saved analysis
✅ Can delete old analyses
✅ "Saved successfully" message appears
✅ "Viewing Saved Analysis" badge works
✅ Re-analyze button fetches fresh data

---

## 📝 Notes

- **Storage:** Each analysis is ~5-10KB. 1000 analyses = ~5-10MB
- **API Costs:** Saved analyses don't cost API credits when viewed
- **Performance:** Indexes ensure fast queries even with 10,000+ analyses
- **Privacy:** Users can only see their own analyses (filtered by `user_id`)
- **Cleanup:** Consider adding a cron job to delete analyses older than 90 days

---

## 🔗 Related Files

- `server-files/domain-analytics-schema.sql` - Database schema
- `server-files/domain-analytics-db.js` - Database operations
- `server-files/dataforseo-api-endpoints.js` - API endpoints
- `src/components/DomainAnalytics.jsx` - Frontend component

---

**Deployment Date:** {{ DATE }}
**Version:** 2.0
**Status:** Ready for Production ✅
