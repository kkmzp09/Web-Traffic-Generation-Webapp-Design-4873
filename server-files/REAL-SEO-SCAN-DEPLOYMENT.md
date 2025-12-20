# Real SEO Scan Implementation - Deployment Guide

## Overview
This implementation replaces the instant Cheerio-based scans with **REAL DataForSEO On-Page API scans** that follow an async task lifecycle.

## Changes Made

### 1. Database Schema Update
**File:** `add-dataforseo-scan-columns.sql`

Adds columns to `seo_scan_history` table:
- `dataforseo_task_id` - DataForSEO task ID
- `status` - Scan status (queued, running, completed, failed)
- `max_pages` - Plan-based page limit
- `pages_crawled` - Actual pages crawled
- `error_message` - Error details if failed

### 2. New Backend API
**File:** `comprehensive-seo-audit-dataforseo.js`

Replaces `comprehensive-seo-audit.js` with real DataForSEO integration:
- **POST /api/seo/comprehensive-audit** - Start async scan
- **GET /api/seo/scan-status/:scanId** - Check scan progress

### 3. Plan-Based Limits
```javascript
const PLAN_LIMITS = {
  'starter': 10,
  'growth': 50,
  'professional': 200,
  'enterprise': 1000
};
```

## Deployment Steps

### Step 1: Database Migration (VPS)
```bash
# SSH to VPS
ssh root@67.217.60.57

# Connect to PostgreSQL
psql $DATABASE_URL

# Run migration
\i /root/relay/add-dataforseo-scan-columns.sql

# Verify columns added
\d seo_scan_history
```

### Step 2: Upload New Backend File (VPS)
```bash
# From local machine, upload new file
scp server-files/comprehensive-seo-audit-dataforseo.js root@67.217.60.57:/root/relay/

# SSH to VPS
ssh root@67.217.60.57

# Backup old file
cd /root/relay
cp comprehensive-seo-audit.js comprehensive-seo-audit-OLD.js

# Replace with new implementation
mv comprehensive-seo-audit-dataforseo.js comprehensive-seo-audit.js
```

### Step 3: Update Main API File (VPS)
Edit `/root/relay/index.js` or main API file to ensure the route is registered:

```javascript
const comprehensiveAudit = require('./comprehensive-seo-audit');
app.use('/api/seo', comprehensiveAudit);
```

### Step 4: Restart Backend (VPS)
```bash
pm2 restart relay-api
pm2 logs relay-api --lines 50
```

### Step 5: Verify DataForSEO Credentials (VPS)
```bash
# Check .env file has credentials
cat /root/relay/.env | grep DATAFORSEO

# Should show:
# DATAFORSEO_LOGIN=your_login
# DATAFORSEO_PASSWORD=your_password
```

## Frontend Changes (NONE REQUIRED)

The frontend already calls:
- `POST /api/seo/comprehensive-audit` - Will now start real scan
- Frontend should poll or implement status checking

**Optional:** Add polling logic to check scan status:
```javascript
// In SEOAuditDashboard.jsx
const pollScanStatus = async (scanId) => {
  const response = await fetch(`${API_BASE}/api/seo/scan-status/${scanId}`);
  const data = await response.json();
  
  if (data.status === 'running') {
    // Poll again in 5 seconds
    setTimeout(() => pollScanStatus(scanId), 5000);
  } else if (data.status === 'completed') {
    // Update UI with results
    setAuditData(data);
  }
};
```

## Testing Checklist

### Test 1: Start New Scan
```bash
curl -X POST https://api.organitrafficboost.com/api/seo/comprehensive-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "userId": "test-user-id"}'

# Expected response:
# {
#   "success": true,
#   "scanId": 123,
#   "taskId": "12345678-1234-1234-1234-123456789012",
#   "status": "running",
#   "maxPages": 10,
#   "message": "Scan started..."
# }
```

### Test 2: Check Scan Status
```bash
curl https://api.organitrafficboost.com/api/seo/scan-status/123

# Expected responses:
# - status: "running" (while scanning)
# - status: "completed" (when done, includes full results)
# - status: "failed" (if error occurred)
```

### Test 3: Verify Database
```sql
-- Check scan record
SELECT id, url, status, dataforseo_task_id, max_pages, pages_crawled, scanned_at 
FROM seo_scan_history 
WHERE user_id = 'test-user-id' 
ORDER BY scanned_at DESC 
LIMIT 5;

-- Should show:
-- - status changing from 'queued' → 'running' → 'completed'
-- - dataforseo_task_id populated
-- - pages_crawled updated when complete
```

### Test 4: Verify Real Scan Behavior
1. Run scan for same URL twice
2. Verify:
   - ✅ Different `scan_id` each time
   - ✅ Different `dataforseo_task_id` each time
   - ✅ `scanned_at` timestamp updates
   - ✅ Scores can differ (not cached)
   - ✅ Takes time to complete (not instant)

## Rollback Plan

If issues occur:

```bash
# SSH to VPS
ssh root@67.217.60.57
cd /root/relay

# Restore old file
cp comprehensive-seo-audit-OLD.js comprehensive-seo-audit.js

# Restart
pm2 restart relay-api
```

## Cost Monitoring

DataForSEO On-Page API costs approximately:
- **$0.30 per task** (10 pages)
- **$1.50 per task** (50 pages)
- **$6.00 per task** (200 pages)

Monitor usage in DataForSEO dashboard.

## Notes

- ✅ No frontend changes required
- ✅ No auth/subscription/payment changes
- ✅ No UI text changes
- ✅ Respects plan limits
- ✅ Real async scan lifecycle
- ✅ No cached results for new scans
- ⚠️ Requires DataForSEO credentials in .env
- ⚠️ Database migration required before deployment
