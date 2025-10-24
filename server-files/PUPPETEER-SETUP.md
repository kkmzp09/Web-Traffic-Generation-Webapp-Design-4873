# Puppeteer Scanner Setup

This guide explains how to enable the Puppeteer-based scanner that scans JavaScript-rendered pages (like what Google and users actually see).

## Why Use Puppeteer Scanner?

**Current Scanner (Cheerio):**
- ❌ Only reads raw HTML source
- ❌ Doesn't see JavaScript-applied fixes
- ❌ Shows issues even after widget applies fixes

**Puppeteer Scanner:**
- ✅ Renders JavaScript (like a real browser)
- ✅ Sees widget-applied fixes
- ✅ Scans what users and Google actually see
- ✅ More accurate SEO analysis

## Installation

### Step 1: Install Puppeteer on VPS

```bash
cd /root/relay
npm install puppeteer
```

### Step 2: Install Chrome Dependencies (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### Step 3: Upload New Files to VPS

Upload these files to `/root/relay/`:
- `seo-scanner-puppeteer.js`

### Step 4: Enable Puppeteer Scanner

Add environment variable to `.env`:

```bash
nano /root/relay/.env
```

Add this line:
```
USE_PUPPETEER_SCANNER=true
```

### Step 5: Restart API

```bash
pm2 restart relay-api
```

## Verify It's Working

```bash
# Check logs
pm2 logs relay-api --lines 20

# You should see Puppeteer launching when scanning
```

## Test the Scanner

1. Go to your dashboard
2. Scan a page with widget installed (e.g., https://freehosting.me.uk/)
3. The scanner should now see the JavaScript-applied fixes!

## Performance Considerations

**Puppeteer Scanner:**
- ⏱️ Slower (5-10 seconds per scan)
- 💾 Uses more memory (~100-200MB per scan)
- ✅ More accurate

**Cheerio Scanner (default):**
- ⚡ Faster (1-2 seconds per scan)
- 💾 Uses less memory
- ⚠️ Doesn't see JavaScript

## Switching Between Scanners

**Enable Puppeteer:**
```bash
# In .env
USE_PUPPETEER_SCANNER=true
```

**Disable Puppeteer (use Cheerio):**
```bash
# In .env
USE_PUPPETEER_SCANNER=false
# or remove the line entirely
```

Then restart:
```bash
pm2 restart relay-api
```

## Troubleshooting

### Error: "Failed to launch browser"

**Solution:** Install Chrome dependencies (see Step 2)

### Error: "Navigation timeout"

**Solution:** Increase timeout in `seo-scanner-puppeteer.js`:
```javascript
await page.goto(url, {
  waitUntil: 'networkidle2',
  timeout: 60000 // Increase to 60 seconds
});
```

### High Memory Usage

**Solution:** The browser closes after each scan, but you can limit concurrent scans:
- Only scan one page at a time
- Add a queue system for multiple scans

## Recommendation

**For Production:**
- Use Puppeteer scanner for customer-facing scans
- Customers will see accurate results
- No more confusion about "fixed" issues still showing

**For Development:**
- Use Cheerio scanner (faster for testing)
- Switch to Puppeteer when testing widget fixes

## Current Status

- ✅ Puppeteer scanner created
- ✅ Integration added to API
- ⏳ Waiting for installation on VPS
- ⏳ Waiting for environment variable setup

Once enabled, the scanner will see JavaScript-rendered pages and won't show issues that the widget has already fixed!
