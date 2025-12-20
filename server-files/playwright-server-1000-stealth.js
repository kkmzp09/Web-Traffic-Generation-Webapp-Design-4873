// Optimized + Anti-Detection Playwright Server for 1000 Visitor Campaigns
// Combines batch processing, memory management, AND advanced stealth
// Place this in /root/relay/playwright-server.js on your VPS

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({ origin: false }));

// Configuration for 1000 visitor campaigns
const CONFIG = {
  MAX_CONCURRENT_BROWSERS: 15, // Optimized for 8GB RAM
  BATCH_SIZE: 15,
  MEMORY_CHECK_INTERVAL: 30000,
  MAX_MEMORY_MB: 6000,
  BROWSER_TIMEOUT: 120000,
  CAMPAIGNS_FILE: path.join(__dirname, 'campaigns.json'),
};

const PORT = Number(process.env.PORT || 8081);
const API_KEY = process.env.API_KEY;

// ===== ANTI-DETECTION: Fingerprint Generation =====

const USER_AGENTS = {
  chrome_windows: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
  chrome_mac: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
  safari_mac: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ],
  chrome_android: [
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  ],
};

const DESKTOP_RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
];

const MOBILE_RESOLUTIONS = [
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 412, height: 915 },
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFingerprint() {
  const forceMobile = Math.random() < 0.4; // 40% mobile
  const browserTypes = Object.keys(USER_AGENTS);
  
  let browserType;
  if (forceMobile) {
    browserType = 'chrome_android';
  } else {
    const desktopTypes = browserTypes.filter(t => !t.includes('android'));
    browserType = randomChoice(desktopTypes);
  }
  
  const userAgent = randomChoice(USER_AGENTS[browserType]);
  const isMobile = browserType.includes('android');
  const resolutions = isMobile ? MOBILE_RESOLUTIONS : DESKTOP_RESOLUTIONS;
  const viewport = randomChoice(resolutions);
  const timezone = randomChoice(TIMEZONES);
  
  return {
    userAgent,
    viewport,
    isMobile,
    hasTouch: isMobile,
    timezone,
    deviceScaleFactor: isMobile ? 2 : 1,
  };
}

// ===== ANTI-DETECTION: Natural Behavior =====

async function simulateReading(page, isMobile) {
  await page.waitForTimeout(randomInt(1500, 3500));
  
  const scrollSteps = randomInt(4, 8);
  for (let i = 0; i < scrollSteps; i++) {
    let scrollAmount = randomInt(200, 600);
    
    // 2% chance to scroll too far (human error)
    if (Math.random() < 0.02) {
      scrollAmount += randomInt(300, 500);
    }
    
    await page.evaluate((amount) => {
      window.scrollBy({ top: amount, behavior: 'smooth' });
    }, scrollAmount);
    
    await page.waitForTimeout(randomInt(2000, 6000));
    
    // Mouse movements (desktop only)
    if (!isMobile && Math.random() > 0.5) {
      await page.mouse.move(
        randomInt(100, 800),
        randomInt(200, 600),
        { steps: randomInt(10, 30) }
      );
    }
    
    // Sometimes scroll back up (re-reading)
    if (Math.random() > 0.7) {
      await page.evaluate(() => {
        window.scrollBy({ top: -100 - Math.random() * 200, behavior: 'smooth' });
      });
      await page.waitForTimeout(randomInt(1000, 2000));
    }
  }
}

// ===== Campaign Management =====

let activeCampaigns = new Map();
let browserPool = [];

function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024),
    rss: Math.round(used.rss / 1024 / 1024),
  };
}

setInterval(() => {
  const memory = getMemoryUsage();
  console.log(`[Memory] Heap: ${memory.heapUsed}MB, RSS: ${memory.rss}MB`);
  if (memory.rss > CONFIG.MAX_MEMORY_MB) {
    console.warn(`⚠️ High memory: ${memory.rss}MB`);
  }
}, CONFIG.MEMORY_CHECK_INTERVAL);

async function initCampaignsFile() {
  try {
    await fs.access(CONFIG.CAMPAIGNS_FILE);
  } catch {
    await fs.writeFile(CONFIG.CAMPAIGNS_FILE, JSON.stringify({ campaigns: [] }, null, 2));
  }
}

async function readCampaigns() {
  try {
    const data = await fs.readFile(CONFIG.CAMPAIGNS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { campaigns: [] };
  }
}

async function writeCampaigns(data) {
  await fs.writeFile(CONFIG.CAMPAIGNS_FILE, JSON.stringify(data, null, 2));
}

async function saveCampaign(campaign) {
  await initCampaignsFile();
  const data = await readCampaigns();
  data.campaigns.unshift({
    id: campaign.jobId,
    jobId: campaign.jobId,
    targetUrl: campaign.targetUrl,
    visitors: campaign.visitors,
    dwellMs: campaign.dwellMs,
    status: 'running',
    completed: 0,
    failed: 0,
    pagesVisited: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await writeCampaigns(data);
  return data.campaigns[0];
}

async function updateCampaign(jobId, updates) {
  const data = await readCampaigns();
  const index = data.campaigns.findIndex(c => c.jobId === jobId);
  if (index !== -1) {
    data.campaigns[index] = { ...data.campaigns[index], ...updates, updatedAt: new Date().toISOString() };
    await writeCampaigns(data);
    return data.campaigns[index];
  }
  return null;
}

async function getCampaign(jobId) {
  const data = await readCampaigns();
  return data.campaigns.find(c => c.jobId === jobId);
}

// ===== Browser Management with Anti-Detection =====

async function createBrowser() {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--mute-audio',
    ],
  });
  browserPool.push(browser);
  return browser;
}

async function closeBrowser(browser) {
  try {
    await browser.close();
    browserPool = browserPool.filter(b => b !== browser);
  } catch (err) {
    console.error('Error closing browser:', err.message);
  }
}

// ===== Process Visitor with Full Anti-Detection =====

async function processVisitor(url, dwellMs, jobId) {
  let browser = null;
  let context = null;
  
  try {
    const memory = getMemoryUsage();
    if (memory.rss > CONFIG.MAX_MEMORY_MB) {
      console.warn(`⚠️ Memory limit: ${memory.rss}MB, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Generate unique fingerprint for this visitor
    const fingerprint = generateFingerprint();
    
    browser = await createBrowser();
    context = await browser.newContext({
      userAgent: fingerprint.userAgent,
      viewport: fingerprint.viewport,
      isMobile: fingerprint.isMobile,
      hasTouch: fingerprint.hasTouch,
      timezoneId: fingerprint.timezone,
      deviceScaleFactor: fingerprint.deviceScaleFactor,
      locale: 'en-US',
    });
    
    const page = await context.newPage();
    
    // Anti-detection: Override navigator properties
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    // Navigate
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Natural reading behavior
    await simulateReading(page, fingerprint.isMobile);
    
    // Try to click a link (multi-page visit)
    try {
      const links = await page.$$('a[href^="http"], a[href^="/"]');
      if (links.length > 0) {
        const randomLink = links[Math.floor(Math.random() * links.length)];
        await randomLink.click({ timeout: 5000 });
        await page.waitForTimeout(dwellMs / 2);
        
        await updateCampaign(jobId, {
          pagesVisited: ((await getCampaign(jobId))?.pagesVisited || 0) + 1,
        });
      }
    } catch (err) {
      // Link click failed, that's okay
    }
    
    await closeBrowser(browser);
    
    const campaign = await getCampaign(jobId);
    await updateCampaign(jobId, {
      completed: (campaign?.completed || 0) + 1,
      pagesVisited: (campaign?.pagesVisited || 0) + 1,
    });
    
    return { success: true };
    
  } catch (err) {
    console.error(`Visitor failed: ${err.message}`);
    if (browser) await closeBrowser(browser);
    
    const campaign = await getCampaign(jobId);
    await updateCampaign(jobId, {
      failed: (campaign?.failed || 0) + 1,
    });
    
    return { success: false, error: err.message };
  }
}

// ===== Batch Processing =====

async function processCampaignInBatches(jobId, urls, dwellMs) {
  const totalVisitors = urls.length;
  const batchSize = CONFIG.BATCH_SIZE;
  
  console.log(`[Campaign ${jobId}] Starting ${totalVisitors} visitors in batches of ${batchSize}`);
  
  for (let i = 0; i < totalVisitors; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalVisitors / batchSize);
    
    console.log(`[Campaign ${jobId}] Batch ${batchNumber}/${totalBatches} (${batch.length} visitors)`);
    
    const promises = batch.map(url => processVisitor(url, dwellMs, jobId));
    await Promise.all(promises);
    
    if (i + batchSize < totalVisitors) {
      console.log(`[Campaign ${jobId}] Batch ${batchNumber} complete, pausing 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  await updateCampaign(jobId, { status: 'completed' });
  activeCampaigns.delete(jobId);
  
  console.log(`[Campaign ${jobId}] ✅ Completed!`);
}

// ===== API Endpoints =====

app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  next();
});

app.post('/api/campaign/start', async (req, res) => {
  try {
    const { urls, dwellMs = 30000 } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Invalid URLs array' });
    }
    
    const jobId = Date.now().toString();
    const targetUrl = urls[0];
    
    await saveCampaign({ jobId, targetUrl, visitors: urls.length, dwellMs });
    
    activeCampaigns.set(jobId, { jobId, targetUrl, total: urls.length, status: 'running' });
    
    processCampaignInBatches(jobId, urls, dwellMs).catch(err => {
      console.error(`Campaign ${jobId} error:`, err);
      updateCampaign(jobId, { status: 'failed' });
    });
    
    res.json({
      jobId,
      message: `Campaign started with ${urls.length} visitors`,
      estimatedDuration: `${Math.ceil((urls.length / CONFIG.BATCH_SIZE) * 2)} minutes`,
    });
    
  } catch (err) {
    console.error('Start campaign error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/results/:id', async (req, res) => {
  try {
    const campaign = await getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({
      jobId: campaign.jobId,
      total: campaign.visitors,
      completed: campaign.completed,
      failed: campaign.failed,
      inProgress: campaign.visitors - campaign.completed - campaign.failed,
      pagesVisited: campaign.pagesVisited,
      status: campaign.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/campaigns', async (req, res) => {
  try {
    const data = await readCampaigns();
    res.json({ campaigns: data.campaigns.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  const memory = getMemoryUsage();
  res.json({
    status: 'ok',
    activeCampaigns: activeCampaigns.size,
    activeBrowsers: browserPool.length,
    memory,
    config: {
      maxConcurrent: CONFIG.MAX_CONCURRENT_BROWSERS,
      batchSize: CONFIG.BATCH_SIZE,
    },
  });
});

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  for (const browser of browserPool) {
    await closeBrowser(browser);
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Optimized + Stealth Playwright Server on port ${PORT}`);
  console.log(`📊 Max concurrent: ${CONFIG.MAX_CONCURRENT_BROWSERS}`);
  console.log(`🛡️ Anti-detection: ENABLED`);
});
