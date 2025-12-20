# Real SEO Scan - Backend Deployment Guide

## Summary

Modified `/api/seo/comprehensive-audit` endpoint to trigger **REAL DataForSEO On-Page scans** instead of instant Cheerio-based analysis.

---

## Changes Made

### ✅ Modified File
**File:** `server-files/comprehensive-seo-audit.js`

**Before:** Instant Cheerio HTML parsing (fake scan)  
**After:** Real DataForSEO On-Page API crawl (async, 30-60 seconds)

### ✅ What Changed
- Replaced `axios` + `cheerio` with `dataforseo-onpage-service`
- Now calls `dataforSEOOnPage.postOnPageTask()` to start real crawl
- Stores `dataforseo_task_id` in existing `seo_scans` table
- Returns immediately with `status: 'crawling'`
- Frontend can poll `/api/dataforseo/onpage/status/:scanId` for results

### ✅ What Did NOT Change
- ❌ No database schema changes
- ❌ No new tables or columns
- ❌ No frontend changes
- ❌ No new endpoints
- ❌ No auth/subscription/payment changes
- ❌ Uses existing `seo_scans` table with `dataforseo_task_id` column

---

## Deployment Steps (VPS Only)

### Step 1: Backup Current File
```bash
ssh root@67.217.60.57
cd /root/relay
cp comprehensive-seo-audit.js comprehensive-seo-audit-BACKUP-$(date +%Y%m%d).js
```

### Step 2: Upload New File
```bash
# From local machine
scp server-files/comprehensive-seo-audit.js root@67.217.60.57:/root/relay/
```

### Step 3: Verify DataForSEO Service Exists
```bash
ssh root@67.217.60.57
cd /root/relay
ls -la dataforseo-onpage-service.js
# Should exist - this file is already deployed
```

### Step 4: Restart Backend
```bash
pm2 restart relay-api
pm2 logs relay-api --lines 50
```

### Step 5: Verify Deployment
```bash
# Check logs for startup
pm2 logs relay-api --lines 20

# Test endpoint
curl -X POST https://api.organitrafficboost.com/api/seo/comprehensive-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "userId": "test-user"}'

# Expected response:
# {
#   "success": true,
#   "scanId": 123,
#   "taskId": "...",
#   "status": "crawling",
#   "message": "DataForSEO scan started..."
# }
```

---

## Testing Checklist

### Test 1: Scan Starts Successfully
```bash
curl -X POST https://api.organitrafficboost.com/api/seo/comprehensive-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "userId": "test-123"}'
```

**Expected:**
- ✅ Returns `status: 'crawling'`
- ✅ Returns `scanId` and `taskId`
- ✅ NOT instant (takes time to respond)

### Test 2: Database Record Created
```sql
SELECT id, url, status, dataforseo_task_id, created_at 
FROM seo_scans 
WHERE user_id = 'test-123' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:**
- ✅ Record exists
- ✅ `status = 'crawling'`
- ✅ `dataforseo_task_id` is populated

### Test 3: Check Scan Status
```bash
# Use scanId from Test 1
curl https://api.organitrafficboost.com/api/dataforseo/onpage/status/123
```

**Expected:**
- ✅ Returns scan progress
- ✅ Eventually returns `status: 'ready'` with full results

### Test 4: Multiple Scans Create Different Records
```bash
# Scan same URL twice
curl -X POST https://api.organitrafficboost.com/api/seo/comprehensive-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "userId": "test-123"}'

# Wait 5 seconds, scan again
sleep 5

curl -X POST https://api.organitrafficboost.com/api/seo/comprehensive-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "userId": "test-123"}'
```

**Expected:**
- ✅ Different `scanId` each time
- ✅ Different `dataforseo_task_id` each time
- ✅ Different `created_at` timestamp
- ✅ NOT cached results

---

## Frontend Behavior

### Current Behavior
Frontend calls `/api/seo/comprehensive-audit` and expects immediate results.

### New Behavior
1. Frontend calls `/api/seo/comprehensive-audit`
2. Backend returns `status: 'crawling'` immediately
3. Frontend should:
   - Show "Scan in progress" message
   - Poll `/api/dataforseo/onpage/status/:scanId` every 5 seconds
   - Update UI when `status: 'ready'`

### Frontend Changes Needed (Optional)
Add polling logic in `SEOAuditDashboard.jsx` (see `FRONTEND-POLLING-EXAMPLE.md`)

---

## Rollback Plan

If issues occur:

```bash
ssh root@67.217.60.57
cd /root/relay

# Restore backup
cp comprehensive-seo-audit-BACKUP-YYYYMMDD.js comprehensive-seo-audit.js

# Restart
pm2 restart relay-api
```

---

## Cost Monitoring

DataForSEO On-Page API:
- **~$0.30 per scan** (10 pages)
- Monitor usage in DataForSEO dashboard
- Consider rate limiting if needed

---

## Verification

After deployment, verify:

1. ✅ "Run New Audit" triggers real DataForSEO task
2. ✅ Scan does NOT complete instantly
3. ✅ Different `scanId` and `taskId` for each scan
4. ✅ `dataforseo_task_id` stored in database
5. ✅ Status changes from 'crawling' to 'ready'

---

## Notes

- ✅ No database migrations required
- ✅ Uses existing `seo_scans` table
- ✅ No frontend changes required (but polling recommended)
- ✅ No auth/subscription changes
- ✅ Backend-only deployment
- ⚠️ Requires DataForSEO credentials in VPS .env
- ⚠️ Frontend will see `status: 'crawling'` initially
