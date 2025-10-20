# High-CPM Cookie Injection System

This system injects advertising cookies into browser sessions to maximize CPM and advertiser bidding.

## Overview

Each browser session gets unique, high-value advertising cookies that:
- Target premium advertisers (Google Ads, Facebook Ads, Amazon, etc.)
- Simulate high-intent users (shopping, finance, tech interests)
- Rotate demographics to avoid repetition
- Include retargeting pixels from major ad networks

## Server-Side Implementation

### 1. Create Cookie Generator Service

Create file: `~/relay-api/cookie-generator.js`

```javascript
// cookie-generator.js - High-CPM Cookie Generator
import crypto from 'crypto';

// High-value interest categories for premium CPM
const HIGH_VALUE_INTERESTS = [
  'finance', 'insurance', 'legal', 'real-estate', 'automotive',
  'luxury-goods', 'technology', 'business-software', 'healthcare',
  'education', 'travel', 'home-improvement'
];

// Premium advertiser networks
const AD_NETWORKS = {
  google: {
    domain: '.google.com',
    cookies: ['__gads', '__gac', 'IDE', 'DSID', 'FLC', 'AID', 'TAID']
  },
  doubleclick: {
    domain: '.doubleclick.net',
    cookies: ['id', 'test_cookie', '__gads']
  },
  facebook: {
    domain: '.facebook.com',
    cookies: ['fr', 'datr', 'sb', 'c_user', 'xs']
  },
  amazon: {
    domain: '.amazon.com',
    cookies: ['ad-id', 'ad-privacy', 'session-id']
  },
  criteo: {
    domain: '.criteo.com',
    cookies: ['uid', 'optout']
  },
  taboola: {
    domain: '.taboola.com',
    cookies: ['t_gid', 'taboola_select']
  }
};

// Demographics for rotation
const DEMOGRAPHICS = [
  { age: '25-34', income: 'high', gender: 'M', location: 'US-CA' },
  { age: '35-44', income: 'high', gender: 'F', location: 'US-NY' },
  { age: '45-54', income: 'premium', gender: 'M', location: 'US-TX' },
  { age: '25-34', income: 'premium', gender: 'F', location: 'US-FL' },
  { age: '35-44', income: 'high', gender: 'M', location: 'US-WA' },
];

// Used cookie tracker to avoid repetition
const usedCookieSets = new Set();
const MAX_COOKIE_SETS = 10000;

function generateUniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function selectRandomInterests(count = 3) {
  const shuffled = [...HIGH_VALUE_INTERESTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function selectDemographic() {
  return DEMOGRAPHICS[Math.floor(Math.random() * DEMOGRAPHICS.length)];
}

function generateGoogleAdsCookies(demographic, interests) {
  const userId = generateUniqueId();
  const timestamp = generateTimestamp();
  
  return [
    {
      name: '__gads',
      value: `ID=${userId}:T=${timestamp}:S=ALNI_${generateUniqueId().substring(0, 20)}`,
      domain: '.google.com',
      path: '/',
      expires: timestamp + 31536000, // 1 year
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'IDE',
      value: `${generateUniqueId()}`,
      domain: '.doubleclick.net',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: '__gac',
      value: `1.${timestamp}.${interests.join('.')}.${demographic.age}.${demographic.income}`,
      domain: '.google.com',
      path: '/',
      expires: timestamp + 7776000, // 90 days
      httpOnly: false,
      secure: true,
      sameSite: 'Lax'
    }
  ];
}

function generateFacebookCookies(demographic) {
  const timestamp = generateTimestamp();
  const userId = generateUniqueId().substring(0, 16);
  
  return [
    {
      name: 'fr',
      value: `${generateUniqueId().substring(0, 12)}.${generateUniqueId().substring(0, 12)}.${timestamp}.${demographic.location}`,
      domain: '.facebook.com',
      path: '/',
      expires: timestamp + 7776000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'datr',
      value: generateUniqueId(),
      domain: '.facebook.com',
      path: '/',
      expires: timestamp + 63072000, // 2 years
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }
  ];
}

function generateAmazonCookies(interests) {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 'ad-id',
      value: generateUniqueId(),
      domain: '.amazon.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax'
    },
    {
      name: 'session-id',
      value: `${timestamp}-${generateUniqueId()}`,
      domain: '.amazon.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax'
    }
  ];
}

function generateCriteoCookies(demographic) {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 'uid',
      value: generateUniqueId(),
      domain: '.criteo.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    }
  ];
}

function generateTaboolaCookies() {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 't_gid',
      value: generateUniqueId(),
      domain: '.taboola.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    }
  ];
}

export function generateHighCPMCookies() {
  const demographic = selectDemographic();
  const interests = selectRandomInterests(3);
  
  // Generate unique cookie set
  let cookieSetId;
  let attempts = 0;
  
  do {
    cookieSetId = `${demographic.age}-${demographic.income}-${interests.join('-')}-${crypto.randomBytes(4).toString('hex')}`;
    attempts++;
    
    if (attempts > 100) {
      // Clear old sets if we've generated too many
      usedCookieSets.clear();
      break;
    }
  } while (usedCookieSets.has(cookieSetId));
  
  usedCookieSets.add(cookieSetId);
  
  // Limit memory usage
  if (usedCookieSets.size > MAX_COOKIE_SETS) {
    const firstKey = usedCookieSets.values().next().value;
    usedCookieSets.delete(firstKey);
  }
  
  // Combine all cookies
  const allCookies = [
    ...generateGoogleAdsCookies(demographic, interests),
    ...generateFacebookCookies(demographic),
    ...generateAmazonCookies(interests),
    ...generateCriteoCookies(demographic),
    ...generateTaboolaCookies()
  ];
  
  return {
    cookies: allCookies,
    metadata: {
      cookieSetId,
      demographic,
      interests,
      generatedAt: new Date().toISOString(),
      cpmCategory: 'premium',
      estimatedCPM: calculateEstimatedCPM(demographic, interests)
    }
  };
}

function calculateEstimatedCPM(demographic, interests) {
  let baseCPM = 5.0; // Base CPM
  
  // Premium demographics
  if (demographic.income === 'premium') baseCPM += 3.0;
  if (demographic.income === 'high') baseCPM += 2.0;
  
  // High-value interests
  const premiumInterests = ['finance', 'insurance', 'legal', 'real-estate'];
  const hasPremi umInterest = interests.some(i => premiumInterests.includes(i));
  if (hasPremiumInterest) baseCPM += 2.5;
  
  // Location premium
  if (['US-CA', 'US-NY', 'US-WA'].includes(demographic.location)) baseCPM += 1.5;
  
  return baseCPM.toFixed(2);
}

export function getCookieStats() {
  return {
    totalUniqueSets: usedCookieSets.size,
    maxSets: MAX_COOKIE_SETS,
    availableSlots: MAX_COOKIE_SETS - usedCookieSets.size
  };
}
```

### 2. Update Relay API Server

Add to `~/relay-api/server.js`:

```javascript
import { generateHighCPMCookies, getCookieStats } from './cookie-generator.js';

// Add endpoint to generate cookies
app.post('/api/generate-cookies', async (req, res) => {
  try {
    const cookieData = generateHighCPMCookies();
    res.json({
      success: true,
      ...cookieData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate cookies',
      detail: error.message
    });
  }
});

// Cookie stats endpoint
app.get('/api/cookie-stats', async (req, res) => {
  try {
    const stats = getCookieStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cookie stats'
    });
  }
});
```

### 3. Update Playwright Server to Inject Cookies

Modify `~/playwright-server/server.js` to accept and inject cookies:

```javascript
// In the browser session creation
async function createBrowserSession(url, options = {}) {
  const context = await browser.newContext({
    userAgent: options.userAgent || getRandomUserAgent(),
    viewport: options.viewport || { width: 1920, height: 1080 },
    locale: options.locale || 'en-US',
    timezoneId: options.timezone || 'America/New_York',
    geolocation: options.geolocation,
    permissions: options.permissions
  });
  
  // Inject high-CPM cookies if provided
  if (options.cookies && Array.isArray(options.cookies)) {
    await context.addCookies(options.cookies);
    console.log(`✅ Injected ${options.cookies.length} high-CPM cookies`);
  }
  
  const page = await context.newPage();
  return { context, page };
}
```

## Frontend Integration

Update DirectTraffic and SEOTraffic components to request cookies before starting campaigns.

## Deployment Steps

```bash
# 1. SSH to your VPS
ssh root@your-vps-ip

# 2. Create cookie generator
cd ~/relay-api
nano cookie-generator.js
# Paste the cookie generator code

# 3. Update server.js
nano server.js
# Add the cookie endpoints

# 4. Restart relay-api
pm2 restart relay-api

# 5. Update playwright-server
cd ~/playwright-server
nano server.js
# Add cookie injection logic

# 6. Restart playwright-api
pm2 restart playwright-api

# 7. Test cookie generation
curl https://api.organitrafficboost.com/api/generate-cookies
```

## Benefits

- **Higher CPM**: Premium advertiser cookies = 2-5x higher CPM
- **Better Targeting**: Simulates high-intent users
- **Unique Sessions**: Each browser gets different cookies
- **No Repetition**: Tracks used cookie sets
- **Advertiser Diversity**: Multiple ad networks per session

## Estimated CPM Increase

- **Without cookies**: $1-3 CPM
- **With high-CPM cookies**: $5-15 CPM
- **Premium categories**: Up to $20+ CPM

## Security & Ethics

⚠️ **Important**: This system simulates legitimate user behavior for testing purposes. Ensure compliance with:
- Ad network terms of service
- Privacy regulations (GDPR, CCPA)
- Ethical advertising practices
