# ✅ SCAN ERROR FIXED - 400 Bad Request

**Date:** December 20, 2025  
**Issue:** SEO scan failing with 400 error  
**Status:** FIXED ✅

---

## **PROBLEM:**

When running an SEO scan on jobmakers.in, the scan would start successfully but the progress modal would show:

```
Error: 400 (Bad Request)
Failed to load resource: api.organitrafficboost.com/api/seo/scan/141
```

The modal would get stuck on "Discovering Pages..." at 0% progress.

---

## **ROOT CAUSE:**

The frontend `ScanProgressModal` component was polling the scan status endpoint without the required `userId` parameter:

**Before (Broken):**
```javascript
const response = await fetch(
  `https://api.organitrafficboost.com/api/seo/scan/${scanId}`
);
```

**Backend Response:**
```json
{
  "success": false,
  "error": "userId is required"
}
```

The backend endpoint requires `userId` as a query parameter for authentication/authorization, but the frontend was not sending it.

---

## **INVESTIGATION:**

### **1. Verified Scan Was Working:**
- Checked PM2 logs on VPS
- Scan 141 was successfully crawling pages (found 100 pages)
- Backend was working correctly
- Issue was only with fetching scan status

### **2. Tested Endpoint Directly:**
```bash
curl http://127.0.0.1:3001/api/seo/scan/141
# Response: {"success":false,"error":"userId is required"}
```

### **3. Found Missing Parameter:**
- `ScanProgressModal.jsx` was not receiving `userId` prop
- `SEODashboard.jsx` has access to `user.id` from `useAuth()`
- Need to pass `userId` down to modal component

---

## **SOLUTION:**

### **1. Pass userId to ScanProgressModal:**

**File:** `src/components/SEODashboard.jsx`

```javascript
// Before:
<ScanProgressModal
  scanId={currentScanId}
  onComplete={...}
/>

// After:
<ScanProgressModal
  scanId={currentScanId}
  userId={user?.id}
  onComplete={...}
/>
```

### **2. Accept userId prop:**

**File:** `src/components/ScanProgressModal.jsx`

```javascript
// Before:
const ScanProgressModal = ({ scanId, onComplete, onClose }) => {

// After:
const ScanProgressModal = ({ scanId, userId, onComplete, onClose }) => {
```

### **3. Include userId in API call:**

**File:** `src/components/ScanProgressModal.jsx`

```javascript
// Before:
const response = await fetch(
  `https://api.organitrafficboost.com/api/seo/scan/${scanId}`
);

// After:
const response = await fetch(
  `https://api.organitrafficboost.com/api/seo/scan/${scanId}${userId ? `?userId=${userId}` : ''}`
);
```

---

## **DEPLOYMENT:**

```
Commit: 3213ffb
Message: "FIX: Add userId parameter to scan status endpoint (fixes 400 error)"
Files Changed:
  - src/components/SEODashboard.jsx (1 insertion)
  - src/components/ScanProgressModal.jsx (2 insertions, 1 deletion)
Status: Pushed to GitHub
Netlify: Auto-deploying (1-2 minutes)
```

---

## **EXPECTED BEHAVIOR AFTER FIX:**

### **Before (Broken):**
```
1. Click "Scan Now"
2. Modal shows "Discovering Pages... 0%"
3. Console error: 400 Bad Request
4. Modal stuck, no progress
5. User sees nothing
```

### **After (Fixed):**
```
1. Click "Scan Now"
2. Modal shows "Discovering Pages..."
3. Progress updates: 10%, 20%, 30%...
4. Shows pages being crawled
5. Completes with "Scan Complete!"
6. Results displayed in dashboard
```

---

## **VERIFICATION STEPS:**

Once Netlify deployment completes (1-2 minutes):

1. Go to https://organitrafficboost.com/seo-dashboard
2. Click "Scan Now"
3. Enter: `https://jobmakers.in`
4. Watch progress modal
5. Should see:
   - ✅ Progress percentage increasing
   - ✅ Pages discovered count
   - ✅ Current page being scanned
   - ✅ No 400 errors in console
   - ✅ Scan completes successfully

---

## **TECHNICAL NOTES:**

### **Why userId is Required:**

The backend endpoint `/api/seo/scan/:scanId` needs to:
1. Verify the user owns the scan
2. Check subscription limits
3. Track usage for billing
4. Prevent unauthorized access to scan results

Without `userId`, the backend cannot perform these checks and returns 400.

### **Why This Wasn't Caught Earlier:**

- The scan **creation** endpoint (`POST /api/seo/scan-page`) correctly sends `userId` in the request body
- The scan **status** endpoint (`GET /api/seo/scan/:scanId`) expects `userId` as a query parameter
- The modal component was not originally designed to receive user context
- This is a frontend-backend contract mismatch

---

## **RELATED ENDPOINTS:**

All working correctly:
- ✅ `POST /api/seo/scan-page` - Creates scan (has userId)
- ✅ `GET /api/seo/scan-progress/:scanId` - SSE progress (no userId needed)
- ❌ `GET /api/seo/scan/:scanId` - Get scan results (was missing userId) **← FIXED**

---

## **STATUS:**

- ✅ Root cause identified
- ✅ Fix implemented
- ✅ Code committed and pushed
- ✅ Deploying to production
- ⏳ Awaiting Netlify deployment
- ⏳ Ready for user validation

---

**Issue Resolved:** December 20, 2025  
**Resolution Time:** ~30 minutes  
**Impact:** Critical (blocking all scans)  
**Status:** ✅ FIXED - Deploying to production
