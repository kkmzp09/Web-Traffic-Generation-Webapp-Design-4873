// server.js — Playwright Automation API (private on :8081)
// Works with .env: PROXY_HOST/PROXY_PORT/PROXY_USER/PROXY_PASS

// --- Dynamic Fingerprint Generation ---

const USER_AGENTS = {
  chrome_windows: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
  chrome_mac: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
  firefox_windows: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
  ],
  firefox_mac: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
  ],
  edge_windows: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  ],
  safari_mac: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  ],
  chrome_android: [
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  ],
  safari_ios: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ],
};

const DESKTOP_RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1680, height: 1050 },
  { width: 2560, height: 1440 },
  { width: 1600, height: 900 },
  { width: 1280, height: 720 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
];

const MOBILE_RESOLUTIONS = [
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 412, height: 915 },
  { width: 360, height: 800 },
  { width: 384, height: 854 },
  { width: 414, height: 896 },
  { width: 375, height: 812 },
  { width: 428, height: 926 },
  { width: 820, height: 1180 },
  { width: 768, height: 1024 },
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Denver',
  'America/Phoenix', 'America/Toronto', 'America/Vancouver', 'America/Mexico_City',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna', 'Europe/Stockholm',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Seoul',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Jakarta',
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane',
  'Pacific/Auckland', 'America/Sao_Paulo', 'America/Buenos_Aires',
];

const LOCALES = [
  'en-US', 'en-GB', 'en-CA', 'en-AU', 'en-NZ', 'en-IN',
  'de-DE', 'de-AT', 'de-CH',
  'fr-FR', 'fr-CA', 'fr-BE',
  'es-ES', 'es-MX', 'es-AR',
  'it-IT', 'pt-BR', 'pt-PT',
  'ja-JP', 'zh-CN', 'zh-TW', 'ko-KR',
  'nl-NL', 'sv-SE', 'no-NO', 'da-DK', 'fi-FI',
];

const PLATFORMS = {
  windows: 'Win32',
  mac: 'MacIntel',
  linux: 'Linux x86_64',
  android: 'Linux armv8l',
  ios_iphone: 'iPhone',
  ios_ipad: 'iPad',
};

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomFingerprint() {
  // PHASE 2: Increase mobile traffic to 40% (better device mix)
  const forceMobile = Math.random() < 0.4;
  
  const browserTypes = Object.keys(USER_AGENTS);
  let browserType;
  
  if (forceMobile) {
    // Pick mobile browser
    const mobileTypes = browserTypes.filter(t => t.includes('android') || t.includes('ios'));
    browserType = randomChoice(mobileTypes);
  } else {
    // Pick desktop browser
    const desktopTypes = browserTypes.filter(t => !t.includes('android') && !t.includes('ios'));
    browserType = randomChoice(desktopTypes);
  }
  
  const userAgent = randomChoice(USER_AGENTS[browserType]);

  const isMobile = browserType.includes('android') || browserType.includes('ios');

  const resolutions = isMobile ? MOBILE_RESOLUTIONS : DESKTOP_RESOLUTIONS;
  const viewport = randomChoice(resolutions);

  let deviceScaleFactor = 1;
  if (browserType.includes('mac') || browserType.includes('ios')) {
    deviceScaleFactor = randomChoice([2, 2, 3]);
  } else if (isMobile) {
    deviceScaleFactor = randomChoice([2, 2.5, 2.625, 3, 3.5]);
  } else {
    deviceScaleFactor = randomChoice([1, 1, 1, 1.25, 1.5]);
  }

  let platform;
  if (browserType.includes('windows')) platform = PLATFORMS.windows;
  else if (browserType.includes('mac')) platform = PLATFORMS.mac;
  else if (browserType.includes('android')) platform = PLATFORMS.android;
  else if (browserType.includes('ios')) {
    platform = userAgent.includes('iPad') ? PLATFORMS.ios_ipad : PLATFORMS.ios_iphone;
  } else {
    platform = PLATFORMS.linux;
  }

  const timezone = randomChoice(TIMEZONES);
  const locale = randomChoice(LOCALES);

  const hardwareConcurrency = randomChoice([2, 4, 4, 8, 8, 8, 16, 16]);
  const deviceMemory = randomChoice([2, 4, 4, 8, 8, 16]);

  const connections = [
    { effectiveType: '4g', rtt: randomInt(50, 150), downlink: randomInt(5, 20) },
    { effectiveType: '4g', rtt: randomInt(30, 100), downlink: randomInt(10, 50) },
    { effectiveType: '3g', rtt: randomInt(200, 500), downlink: randomInt(1, 5) },
  ];
  const connection = randomChoice(connections);

  const pluginCount = randomInt(0, 5);

  const canvasNoise = Math.random() * 0.0001;
  const webglVendor = randomChoice([
    'Intel Inc.',
    'NVIDIA Corporation',
    'AMD',
    'Apple Inc.',
    'Google Inc.',
  ]);
  const webglRenderer = randomChoice([
    'Intel Iris OpenGL Engine',
    'NVIDIA GeForce GTX 1060',
    'AMD Radeon RX 580',
    'Apple M1',
    'ANGLE (Intel, Intel(R) UHD Graphics 620)',
  ]);

  return {
    userAgent,
    viewport,
    deviceScaleFactor,
    isMobile,
    hasTouch: isMobile,
    platform,
    timezone,
    locale,
    hardwareConcurrency,
    deviceMemory,
    connection,
    pluginCount,
    canvasNoise,
    webglVendor,
    webglRenderer,
  };
}

// --- Optional GA4 Measurement Protocol helper ---
async function sendGA4PageView({ measurementId, apiSecret, pageLocation, pageReferrer, clientId }) {
  if (!measurementId || !apiSecret) return;
  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
  const body = {
    client_id: clientId || `${Date.now()}.${Math.floor(Math.random() * 1e6)}`,
    events: [{
      name: 'page_view',
      params: {
        page_location: pageLocation,
        page_referrer: pageReferrer || ''
      }
    }]
  };
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (r.ok) console.log('[GA4 MP] sent page_view for', pageLocation);
  } catch {}
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import stealthSystem from './advanced-stealth.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: false }));

const PORT = Number(process.env.PORT || 8081);
const API_KEY = process.env.API_KEY;

const PROXY_HOST = process.env.PROXY_HOST || '';
const PROXY_PORT = process.env.PROXY_PORT || '';
const PROXY_USER = process.env.PROXY_USER || '';
const PROXY_PASS = process.env.PROXY_PASS || '';
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || 2));

const proxyConfig =
  PROXY_HOST && PROXY_PORT
    ? {
        server: `http://${PROXY_HOST}:${PROXY_PORT}`,
        username: PROXY_USER || undefined,
        password: PROXY_PASS || undefined,
      }
    : undefined;

// --- tiny concurrency pool ---
async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (true) {
      const cur = i++;
      if (cur >= items.length) break;
      results[cur] = await worker(items[cur], cur);
    }
  });
  await Promise.all(workers);
  return results;
}

// --- API key auth ---
app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  next();
});

// --- health endpoint ---
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    port: PORT,
    proxy: !!proxyConfig,
    concurrency: CONCURRENCY,
    node: process.version,
  });
});

// --- Natural reading behavior with mouse movements ---
async function simulateReading(page, isMobile) {
  console.log('  [Reading] Simulating natural reading behavior...');

  // Random initial pause (user looking at page)
  await page.waitForTimeout(randomInt(1500, 3500));

  // Scroll down slowly while "reading"
  const scrollSteps = randomInt(4, 8);

  for (let i = 0; i < scrollSteps; i++) {
    // Random scroll amount (simulating reading sections)
    let scrollAmount = randomInt(200, 600);
    
    // 2% chance to scroll too far (human error)
    if (Math.random() < 0.02) {
      scrollAmount += randomInt(300, 500);
      console.log('  [Human] Scrolled too far (natural error)');
    }

    await page.evaluate((amount) => {
      window.scrollBy({
        top: amount,
        behavior: 'smooth'
      });
    }, scrollAmount);

    // Pause to "read" content (2-6 seconds)
    const readingPause = randomInt(2000, 6000);
    await page.waitForTimeout(readingPause);

    // Occasionally move mouse (desktop only)
    if (!isMobile && Math.random() > 0.5) {
      await page.mouse.move(
        randomInt(100, 800),
        randomInt(200, 600),
        { steps: randomInt(10, 30) }
      );
    }

    // Sometimes scroll back up a bit (re-reading)
    if (Math.random() > 0.7) {
      await page.evaluate(() => {
        window.scrollBy({
          top: -100 - Math.random() * 200,
          behavior: 'smooth'
        });
      });
      await page.waitForTimeout(randomInt(1000, 2000));
    }
  }

  console.log('  [Reading] Finished reading behavior');
}

// --- Get internal links from the page ---
async function getInternalLinks(page, baseUrl) {
  try {
    const links = await page.evaluate((base) => {
      const baseDomain = new URL(base).hostname;
      const allLinks = Array.from(document.querySelectorAll('a[href]'));

      return allLinks
        .map(a => a.href)
        .filter(href => {
          try {
            const url = new URL(href);
            // Only internal links, no anchors, no files
            return url.hostname === baseDomain &&
                   !href.includes('#') &&
                   !href.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i);
          } catch {
            return false;
          }
        })
        .filter((href, idx, arr) => arr.indexOf(href) === idx); // Unique
    }, baseUrl);

    return links;
  } catch (err) {
    console.log('  [Links] Error getting internal links:', err.message);
    return [];
  }
}

// --- Click on ads (1% chance) ---
async function clickOnAd(page, indent = '') {
  try {
    console.log(`${indent}🎯 [Ad] Attempting to click on an ad (1 in 100 chance triggered)...`);

    // Common ad selectors (Google Ads, display ads, etc.)
    const adSelectors = [
      // Google Ads
      'ins.adsbygoogle',
      'iframe[id*="google_ads"]',
      'div[id*="google_ads"]',
      'div[class*="adsbygoogle"]',
      
      // Generic ad containers
      'div[class*="advertisement"]',
      'div[class*="ad-container"]',
      'div[class*="ad-banner"]',
      'div[id*="ad-"]',
      'div[class*="ad-"]',
      
      // Common ad networks
      'div[id*="taboola"]',
      'div[id*="outbrain"]',
      'div[class*="sponsored"]',
      'a[class*="ad-link"]',
      
      // Fallback: any iframe (often contains ads)
      'iframe[src*="doubleclick"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="adservice"]'
    ];

    // Try to find an ad element
    let adClicked = false;
    
    for (const selector of adSelectors) {
      try {
        const adElements = await page.$$(selector);
        
        if (adElements.length > 0) {
          // Pick a random ad from available ones
          const randomAd = adElements[Math.floor(Math.random() * adElements.length)];
          
          // Check if element is visible
          const isVisible = await randomAd.isVisible().catch(() => false);
          
          if (isVisible) {
            // Scroll to ad first (natural behavior)
            await randomAd.scrollIntoViewIfNeeded().catch(() => {});
            await page.waitForTimeout(randomInt(1000, 2000));
            
            // Move mouse to ad area (desktop only)
            const box = await randomAd.boundingBox().catch(() => null);
            if (box) {
              const x = box.x + box.width / 2 + randomInt(-20, 20);
              const y = box.y + box.height / 2 + randomInt(-20, 20);
              await page.mouse.move(x, y, { steps: randomInt(10, 20) });
              await page.waitForTimeout(randomInt(500, 1500));
            }
            
            // Click the ad
            await randomAd.click({ force: true }).catch(() => {});
            console.log(`${indent}✅ [Ad] Clicked on ad element: ${selector}`);
            adClicked = true;
            
            // Wait a bit after clicking (ad might open new tab/window)
            await page.waitForTimeout(randomInt(2000, 4000));
            
            break;
          }
        }
      } catch (err) {
        // Continue to next selector
        continue;
      }
    }
    
    if (!adClicked) {
      console.log(`${indent}ℹ️ [Ad] No clickable ads found on this page`);
    }
    
  } catch (err) {
    console.log(`${indent}⚠️ [Ad] Error clicking ad:`, err.message);
  }
}

// --- PHASE 1: Ad Viewability - Ensure ads are visible for 2+ seconds ---
async function ensureAdViewability(page, indent = '') {
  try {
    const adSelectors = [
      'ins.adsbygoogle',
      'iframe[id*="google_ads"]',
      'div[id*="google_ads"]',
      'div[class*="adsbygoogle"]',
      'div[class*="advertisement"]',
    ];

    let adsViewed = 0;
    
    for (const selector of adSelectors) {
      try {
        const ads = await page.$$(selector);
        
        if (ads.length > 0) {
          // View 1-2 random ads
          const adsToView = Math.min(randomInt(1, 2), ads.length);
          
          for (let i = 0; i < adsToView; i++) {
            const ad = ads[i];
            const isVisible = await ad.isVisible().catch(() => false);
            
            if (isVisible) {
              // Scroll ad into view
              await ad.scrollIntoViewIfNeeded().catch(() => {});
              await page.waitForTimeout(randomInt(500, 1000));
              
              // Keep ad in viewport for 2-4 seconds (viewability requirement)
              const viewTime = randomInt(2000, 4000);
              await page.waitForTimeout(viewTime);
              
              adsViewed++;
              console.log(`${indent}💰 [AdSense] Ad viewed for ${(viewTime/1000).toFixed(1)}s (viewable impression)`);
            }
          }
          
          if (adsViewed > 0) break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (adsViewed === 0) {
      console.log(`${indent}ℹ️ [AdSense] No ads found for viewability tracking`);
    }
    
  } catch (err) {
    console.log(`${indent}⚠️ [AdSense] Error in viewability tracking:`, err.message);
  }
}

// --- PHASE 2: Content Engagement - Text selection, form interaction ---
async function simulateContentEngagement(page, indent = '') {
  try {
    // 5% chance to select text
    if (Math.random() < 0.05) {
      await page.evaluate(() => {
        try {
          const paragraphs = Array.from(document.querySelectorAll('p, div, span')).filter(el => el.innerText && el.innerText.length > 50);
          if (paragraphs.length > 0) {
            const randomP = paragraphs[Math.floor(Math.random() * paragraphs.length)];
            const text = randomP.innerText;
            const startPos = Math.floor(Math.random() * (text.length - 50));
            const endPos = startPos + Math.floor(Math.random() * 50) + 20;
            
            const selection = window.getSelection();
            const range = document.createRange();
            const textNode = randomP.firstChild || randomP;
            
            if (textNode.nodeType === Node.TEXT_NODE) {
              range.setStart(textNode, Math.min(startPos, textNode.length));
              range.setEnd(textNode, Math.min(endPos, textNode.length));
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        } catch (e) {}
      }).catch(() => {});
      
      await page.waitForTimeout(randomInt(1000, 2000));
      console.log(`${indent}📝 [Engagement] Selected text (content interaction)`);
      
      // Deselect after a moment
      await page.evaluate(() => {
        window.getSelection().removeAllRanges();
      }).catch(() => {});
    }
    
    // 3% chance to interact with form elements
    if (Math.random() < 0.03) {
      const inputs = await page.$$('input[type="text"], input[type="email"], input[type="search"], textarea');
      if (inputs.length > 0) {
        const randomInput = inputs[Math.floor(Math.random() * inputs.length)];
        await randomInput.scrollIntoViewIfNeeded().catch(() => {});
        await randomInput.click().catch(() => {});
        await page.waitForTimeout(randomInt(500, 1000));
        console.log(`${indent}📝 [Engagement] Clicked form input (interaction signal)`);
      }
    }
    
  } catch (err) {
    // Silent fail
  }
}

// --- PHASE 3: Video Engagement - Play videos if present ---
async function engageWithVideo(page, indent = '') {
  try {
    // 20% chance to interact with videos
    if (Math.random() > 0.2) return;
    
    const videos = await page.$$('video');
    if (videos.length > 0) {
      const video = videos[0];
      const isVisible = await video.isVisible().catch(() => false);
      
      if (isVisible) {
        await video.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(randomInt(500, 1000));
        
        // Try to play video
        await video.click().catch(() => {});
        
        // Watch for 10-20 seconds
        const watchTime = randomInt(10000, 20000);
        await page.waitForTimeout(watchTime);
        
        console.log(`${indent}🎥 [Video] Watched video for ${(watchTime/1000).toFixed(0)}s (high-value engagement)`);
      }
    }
    
  } catch (err) {
    // Silent fail
  }
}

// --- PHASE 1: Ad Hover - Mouse over ads (10% chance) ---
async function hoverOverAds(page, indent = '') {
  try {
    // 10% chance to hover over ads
    if (Math.random() > 0.1) return;
    
    const adSelectors = [
      'ins.adsbygoogle',
      'iframe[id*="google_ads"]',
      'div[class*="adsbygoogle"]',
    ];

    for (const selector of adSelectors) {
      try {
        const ads = await page.$$(selector);
        
        if (ads.length > 0) {
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          const isVisible = await randomAd.isVisible().catch(() => false);
          
          if (isVisible) {
            const box = await randomAd.boundingBox().catch(() => null);
            
            if (box) {
              // Move mouse to ad area
              const x = box.x + box.width / 2 + randomInt(-20, 20);
              const y = box.y + box.height / 2 + randomInt(-20, 20);
              
              await page.mouse.move(x, y, { steps: randomInt(10, 20) });
              
              // Hover for 1-3 seconds
              const hoverTime = randomInt(1000, 3000);
              await page.waitForTimeout(hoverTime);
              
              console.log(`${indent}👀 [AdSense] Hovered over ad for ${(hoverTime/1000).toFixed(1)}s (engagement signal)`);
              break;
            }
          }
        }
      } catch (err) {
        continue;
      }
    }
    
  } catch (err) {
    console.log(`${indent}⚠️ [AdSense] Error hovering over ads:`, err.message);
  }
}

// --- Visit a page with natural behavior ---
async function visitPageWithBehavior(page, url, depth, maxDepth, isMobile, visitedUrls) {
  if (depth > maxDepth) {
    console.log(`  [Depth] Max depth ${maxDepth} reached, stopping`);
    return;
  }

  if (visitedUrls.has(url)) {
    console.log(`  [Skip] Already visited: ${url}`);
    return;
  }

  visitedUrls.add(url);

  const indent = '  '.repeat(depth);
  console.log(`${indent}[Visit] Depth ${depth}: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Handle cookie consent
    const consentSelectors = [
      '#onetrust-accept-btn-handler',
      'button#accept',
      'button[aria-label="Accept"]',
      'button:has-text("Accept all")',
      'text=Accept all',
      'text=I agree',
    ];

    for (const sel of consentSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.click();
          console.log(`${indent}[Cookie] Accepted consent`);
          break;
        }
      } catch {}
    }

    await page.waitForLoadState('networkidle').catch(() => {});

    // Trigger GA4 if present
    await page.evaluate(() => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view');
      }
    }).catch(() => {});

    // Natural reading behavior
    await simulateReading(page, isMobile);

    // PHASE 2: Content Engagement - Text selection, form interaction
    await simulateContentEngagement(page, indent);

    // PHASE 3: Video Engagement - Watch videos if present
    await engageWithVideo(page, indent);

    // PHASE 1: Ad Viewability - View ads for 2+ seconds (ALWAYS)
    await ensureAdViewability(page, indent);

    // PHASE 1: Ad Hover - Hover over ads (10% chance)
    await hoverOverAds(page, indent);

    // Ad clicking (variable rate: 0.5% - 2% for realism)
    const adClickRate = 0.005 + Math.random() * 0.015; // 0.5% to 2%
    if (Math.random() < adClickRate) {
      // 5% chance to "miss" the click (human error)
      if (Math.random() < 0.05) {
        console.log(`${indent}🤷 [Human] Attempted ad click but missed (natural error)`);
      } else {
        await clickOnAd(page, indent);
      }
    }

    // Get internal links
    const internalLinks = await getInternalLinks(page, url);
    console.log(`${indent}[Links] Found ${internalLinks.length} internal links`);

    // Decide whether to click on an internal link (70% chance)
    if (internalLinks.length > 0 && Math.random() > 0.3 && depth < maxDepth) {
      // Pick 1-2 random links to visit
      const linksToVisit = randomInt(1, Math.min(2, internalLinks.length));
      const shuffled = internalLinks.sort(() => Math.random() - 0.5);
      const selectedLinks = shuffled.slice(0, linksToVisit);

      console.log(`${indent}[Click] Will visit ${selectedLinks.length} internal link(s)`);

      for (const link of selectedLinks) {
        // Random pause before clicking (thinking time)
        await page.waitForTimeout(randomInt(2000, 5000));

        // 3% chance to skip this link (changed mind / distracted)
        if (Math.random() < 0.03) {
          console.log(`${indent}🤷 [Human] Changed mind, skipping link (natural behavior)`);
          continue;
        }

        // Recursively visit the internal link
        await visitPageWithBehavior(page, link, depth + 1, maxDepth, isMobile, visitedUrls);

        // Random pause after returning (simulating back button or new tab close)
        await page.waitForTimeout(randomInt(1000, 3000));
      }
    } else {
      console.log(`${indent}[Click] Not clicking any links (random decision or max depth)`);
    }

    // Final dwell time on this page
    const finalDwell = randomInt(2000, 5000);
    await page.waitForTimeout(finalDwell);

  } catch (err) {
    console.log(`${indent}[Error] Failed to visit ${url}:`, err.message);
  }
}

// --- main browser worker with dynamic fingerprinting and natural behavior ---
async function visitOnce(url, dwellMs, scroll, maxDepth = 2, cookies = null, cookieMetadata = null) {
  const HEADLESS = (process.env.HEADLESS ?? 'true') === 'true';
  const NAV_TIMEOUT = Math.max(30000, Number(process.env.NAV_TIMEOUT_MS || 90000));

  // Generate unique random fingerprint for this visit
  const profile = generateRandomFingerprint();

  console.log(`[Fingerprint] ${profile.isMobile ? 'Mobile' : 'Desktop'} | ${profile.viewport.width}x${profile.viewport.height} | ${profile.locale} | ${profile.timezone} | CPU:${profile.hardwareConcurrency} | RAM:${profile.deviceMemory}GB`);

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
    ]
  });

  const contextOpts = proxyConfig ? { proxy: proxyConfig } : {};
  const context = await browser.newContext({
    ...contextOpts,
    userAgent: profile.userAgent,
    locale: profile.locale,
    timezoneId: profile.timezone,
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
  });


// 🍪 Inject high-CPM cookies
if (cookies && Array.isArray(cookies) && cookies.length > 0) {
  try {
    await context.addCookies(cookies);
    const cpmInfo = cookieMetadata?.estimatedCPM ? `$${cookieMetadata.estimatedCPM}` : 'N/A';
    console.log(`🍪 [Cookies] Injected ${cookies.length} high-CPM cookies | CPM: ${cpmInfo}`);
  } catch (err) {
    console.log(`⚠️ [Cookies] Failed:`, err.message);
  }
}

// 🛡️ INJECT ADVANCED STEALTH
  const stealthScript = stealthSystem.generateStealthScript(profile);
  await context.addInitScript(stealthScript);
  console.log(`🛡️ [Stealth] Advanced anti-detection enabled`);

  // Advanced fingerprint randomization
  await context.addInitScript((fp) => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', {
      get: () => new Array(fp.pluginCount).fill({})
    });
    Object.defineProperty(navigator, 'platform', { get: () => fp.platform });
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => fp.hardwareConcurrency
    });
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => fp.deviceMemory
    });
    Object.defineProperty(navigator, 'connection', {
      get: () => fp.connection
    });

    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
      const context = this.getContext('2d');
      if (context) {
        const imageData = context.getImageData(0, 0, this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] += fp.canvasNoise;
        }
        context.putImageData(imageData, 0, 0);
      }
      return originalToDataURL.apply(this, arguments);
    };

    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return fp.webglVendor;
      if (parameter === 37446) return fp.webglRenderer;
      return getParameter.apply(this, arguments);
    };

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const originalCreateOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() {
        const oscillator = originalCreateOscillator.apply(this, arguments);
        const originalStart = oscillator.start;
        oscillator.start = function() {
          oscillator.frequency.value += Math.random() * 0.001;
          return originalStart.apply(this, arguments);
        };
        return oscillator;
      };
    }

    Object.defineProperty(screen, 'availWidth', { get: () => fp.viewport.width });
    Object.defineProperty(screen, 'availHeight', { get: () => fp.viewport.height });
    Object.defineProperty(screen, 'width', { get: () => fp.viewport.width });
    Object.defineProperty(screen, 'height', { get: () => fp.viewport.height });

  }, profile);

  // 🔒 WebRTC Protection - Prevent IP leaks
  await context.addInitScript(() => {
    // Block WebRTC to prevent real IP detection
    Object.defineProperty(navigator, 'mediaDevices', {
      get: () => undefined
    });
    
    // Disable RTCPeerConnection
    if (window.RTCPeerConnection) {
      const OriginalRTCPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function() {
        throw new Error('RTCPeerConnection is not supported');
      };
      window.RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
    }
    
    window.RTCSessionDescription = undefined;
    window.RTCIceCandidate = undefined;
    window.webkitRTCPeerConnection = undefined;
    window.mozRTCPeerConnection = undefined;
    
    // Block getUserMedia
    if (navigator.getUserMedia) {
      navigator.getUserMedia = undefined;
    }
    if (navigator.webkitGetUserMedia) {
      navigator.webkitGetUserMedia = undefined;
    }
    if (navigator.mozGetUserMedia) {
      navigator.mozGetUserMedia = undefined;
    }
    if (navigator.msGetUserMedia) {
      navigator.msGetUserMedia = undefined;
    }
  });
  console.log(`🔒 [WebRTC] IP leak protection enabled`);

  const page = await context.newPage();
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);
  page.setDefaultTimeout(NAV_TIMEOUT);

  // --- GA visibility in logs ---
  page.on('request', r => {
    const u = r.url();
    if (u.includes('googletagmanager.com/gtag/js')) {
      console.log('[GA] gtag.js requested:', u);
    }
    if (u.includes('www.google-analytics.com/g/collect')) {
      console.log('[GA] GA4 collect fired:', u);
    }
  });

  // Track visited URLs to avoid loops
  const visitedUrls = new Set();

  // PHASE 1: Track session start time
  const sessionStart = Date.now();

  // PHASE 1: Increase maxDepth for more pages (3 instead of 2)
  const enhancedMaxDepth = Math.max(maxDepth, 3);

  // Visit the main page and potentially internal links
  await visitPageWithBehavior(page, url, 0, enhancedMaxDepth, profile.isMobile, visitedUrls);

  console.log(`[Session] Visited ${visitedUrls.size} total page(s)`);

  // PHASE 1: Ensure minimum session duration (3 minutes)
  const MIN_SESSION_DURATION = 180000; // 3 minutes
  const elapsed = Date.now() - sessionStart;
  
  if (elapsed < MIN_SESSION_DURATION) {
    const remainingTime = MIN_SESSION_DURATION - elapsed;
    console.log(`⏱️ [Session] Extending session by ${(remainingTime/1000).toFixed(0)}s to meet 3-minute minimum`);
    
    // Stay on last page and scroll occasionally
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollBy({
          top: Math.random() * 300,
          behavior: 'smooth'
        });
      }).catch(() => {});
      await page.waitForTimeout(remainingTime / 3);
    }
  }

  const totalDuration = Date.now() - sessionStart;
  console.log(`⏱️ [Session] Total duration: ${(totalDuration/1000).toFixed(1)}s`);

  await context.close();
  await browser.close();
}

// --- /run endpoint ---
app.post('/run', async (req, res) => {
  const { urls, dwellMs = 5000, scroll = false, maxDepth = 2, cookies = null, cookieMetadata = null } = req.body || {};
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'urls[] required' });
  }

  const jobId = `${Date.now()}`;
  console.log(`[${jobId}] queued ${urls.length} url(s), concurrency=${CONCURRENCY}, maxDepth=${maxDepth}, proxy=${!!proxyConfig}`);
  res.json({ status: 'queued', jobId, count: urls.length });

  runPool(urls, CONCURRENCY, async (url, idx) => {
    try {
      console.log(`[${jobId}] (${idx + 1}/${urls.length}) Starting session: ${url}`);
      await visitOnce(url, dwellMs, scroll, maxDepth, cookies, cookieMetadata);
      console.log(`[${jobId}] (${idx + 1}/${urls.length}) Session complete: ${url}`);

      // Report progress to relay
      try {
        await fetch(`http://127.0.0.1:3001/campaigns/${jobId}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY
          },
          body: JSON.stringify({
            completed: idx + 1,
            pagesVisited: (idx + 1) * 2
          })
        });
      } catch (e) { /* ignore */ }

      if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
        await sendGA4PageView({
          measurementId: process.env.GA_MEASUREMENT_ID,
          apiSecret: process.env.GA_API_SECRET,
          pageLocation: url,
          pageReferrer: ''
        });
      }

      return { url, ok: true };
    } catch (err) {
      console.error(`[${jobId}] (${idx + 1}/${urls.length}) Error: ${url}`, err);
      
      // Report failure
      try {
        await fetch(`http://127.0.0.1:3001/campaigns/${jobId}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY
          },
          body: JSON.stringify({
            failed: idx + 1
          })
        });
      } catch (e) { /* ignore */ }
      
      return { url, ok: false, error: String(err) };
    }
  }).then(summary => {
    const ok = summary.filter(s => s?.ok).length;
    console.log(`[${jobId}] finished: ${ok}/${urls.length} succeeded`);
    
    // Mark campaign as completed
    fetch(`http://127.0.0.1:3001/campaigns/${jobId}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY
      },
      body: JSON.stringify({
        status: 'completed',
        completed: ok,
        failed: urls.length - ok
      })
    }).catch(() => {});
  }).catch(err => {
    console.error(`[${jobId}] fatal error`, err);
  });
});

// --- Stop endpoint ---
app.post('/stop/:id', async (req, res) => {
  const jobId = req.params.id;
  console.log(`[${jobId}] Stop requested (note: jobs run async, cannot be stopped once queued)`);

  res.json({
    ok: true,
    jobId,
    message: 'Stop request received. Note: Running jobs cannot be interrupted once started.'
  });
});

app.listen(PORT, () => {
  console.log(`Playwright API listening on http://127.0.0.1:${PORT} (proxy: ${proxyConfig ? 'ON' : 'OFF'})`);
  console.log(`Natural browsing: Reading behavior + Internal link navigation enabled`);
  console.log(`Campaign tracking: Progress reporting to relay enabled`);
});
