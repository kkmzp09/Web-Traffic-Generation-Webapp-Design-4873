# Manual Deployment Steps for DataForSEO On-Page API

## ✅ **What's Already Done:**

1. ✅ Service files uploaded to server
2. ✅ Frontend built and updated
3. ✅ API restarted

## 🔧 **What You Need to Do:**

### **Add 2 Lines to server.js**

SSH into your server:
```bash
ssh root@67.217.60.57
cd /root/relay
nano server.js
```

### **Step 1: Add the require statement**

Find this line (around line 20-30):
```javascript
const seoAutomationApi = require('./seo-automation-api');
```

**Add this line right after it:**
```javascript
const dataforSEOOnPageApi = require('./dataforseo-onpage-api');
```

### **Step 2: Add the route registration**

Find this line (around line 100-150):
```javascript
app.use('/api/seo', seoAutomationApi);
console.log('✅ SEO Automation routes initialized');
```

**Add these lines right after it:**
```javascript
// DataForSEO On-Page API
app.use('/api/dataforseo/onpage', dataforSEOOnPageApi);
console.log('✅ DataForSEO On-Page API routes initialized');
```

### **Step 3: Save and restart**

Save the file (Ctrl+X, Y, Enter)

Then restart:
```bash
pm2 restart relay-api
pm2 logs relay-api --lines 20
```

You should see:
```
✅ DataForSEO On-Page API routes initialized
```

---

## 🧪 **Test It:**

```bash
curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","maxPages":1}'
```

Should return:
```json
{
  "success": true,
  "scanId": 123,
  "taskId": "...",
  "status": "crawling"
}
```

---

## 📝 **Note About Database:**

Since you're using **Neon with API connection**, the database columns will be created automatically when the first scan runs. No manual migration needed!

---

## ✅ **That's It!**

Just add those 2 lines to server.js and restart. Then test the On-Page SEO Analyzer!
