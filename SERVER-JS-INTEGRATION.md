# DataForSEO On-Page API Integration - server.js Setup

## Add These Lines to server.js

### 1. **Import the DataForSEO On-Page API** (near the top with other requires)

```javascript
const dataforSEOOnPageApi = require('./dataforseo-onpage-api');
```

### 2. **Register the Routes** (with other app.use routes)

```javascript
// DataForSEO On-Page API
app.use('/api/dataforseo/onpage', dataforSEOOnPageApi);
console.log('✅ DataForSEO On-Page API routes initialized');
```

---

## Full Example Location in server.js

Add after the other API routes, for example:

```javascript
// ... other routes ...

// SEO Automation API  
app.use('/api/seo', seoAutomationApi);
console.log('✅ SEO Automation API routes initialized');

// DataForSEO On-Page API - ADD THIS
app.use('/api/dataforseo/onpage', dataforSEOOnPageApi);
console.log('✅ DataForSEO On-Page API routes initialized');

// ... rest of server.js ...
```

---

## Routes That Will Be Available

After adding these lines, the following endpoints will be available:

1. **POST** `/api/dataforseo/onpage/scan`
   - Start a new On-Page crawl
   - Body: `{ url, userId, maxPages, enableJavaScript, calculateKeywordDensity }`

2. **GET** `/api/dataforseo/onpage/status/:scanId`
   - Check crawl status
   - Returns: scan progress and status

3. **GET** `/api/dataforseo/onpage/results/:scanId`
   - Get comprehensive analysis results
   - Returns: full DataForSEO analysis data

4. **GET** `/api/dataforseo/onpage/summary/:scanId`
   - Get scan summary only

5. **GET** `/api/dataforseo/onpage/pages/:scanId`
   - Get all crawled pages

6. **GET** `/api/dataforseo/onpage/resources/:scanId`
   - Get page resources (images, scripts, etc.)

---

## After Making Changes

1. **Restart the API:**
   ```bash
   pm2 restart relay-api
   ```

2. **Check logs:**
   ```bash
   pm2 logs relay-api --lines 50
   ```

3. **Test the endpoint:**
   ```bash
   curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan \
     -H "Content-Type: application/json" \
     -d '{"url":"https://example.com","maxPages":1}'
   ```

---

## Environment Variables Required

Make sure your `.env` file has:

```env
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=your-password
DATABASE_URL=postgresql://...
```

---

## Testing

1. Open the On-Page SEO Analyzer page
2. Enter a URL
3. Click "Analyze"
4. Check browser console for detailed logs
5. Results should appear after 30-60 seconds

---

## Cost Information

DataForSEO On-Page API costs vary based on:
- Number of pages crawled
- JavaScript execution enabled
- Browser rendering enabled
- Resource analysis

**Single page scan typically costs:** $0.02 - $0.05

Check your DataForSEO dashboard for exact pricing.
