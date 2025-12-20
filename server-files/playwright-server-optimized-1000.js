// Optimized Playwright Server for 1000 Visitor Campaigns
// Enhanced with batch processing and memory management
// Place this in /root/relay/ on your VPS

const express = require('express');
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Configuration for 1000 visitor campaigns
const CONFIG = {
  MAX_CONCURRENT_BROWSERS: 15, // Optimized for 8GB RAM with non-headless browsers
  BATCH_SIZE: 15,
  MEMORY_CHECK_INTERVAL: 30000, // Check memory every 30 seconds
  MAX_MEMORY_MB: 6000, // Pause if memory exceeds 6GB
  BROWSER_TIMEOUT: 120000, // 2 minutes per browser
  CAMPAIGNS_FILE: path.join(__dirname, 'campaigns.json'),
};

// Campaign tracker
let activeCampaigns = new Map();
let browserPool = [];

// Memory monitoring
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024),
    heapTotal: Math.round(used.heapTotal / 1024 / 1024),
    rss: Math.round(used.rss / 1024 / 1024),
  };
}

// Monitor memory usage
setInterval(() => {
  const memory = getMemoryUsage();
  console.log(`[Memory] Heap: ${memory.heapUsed}MB / ${memory.heapTotal}MB, RSS: ${memory.rss}MB`);
  
  if (memory.rss > CONFIG.MAX_MEMORY_MB) {
    console.warn(`⚠️ High memory usage: ${memory.rss}MB - Pausing new browsers...`);
  }
}, CONFIG.MEMORY_CHECK_INTERVAL);

// Campaign file management
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
    data.campaigns[index] = {
      ...data.campaigns[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeCampaigns(data);
    return data.campaigns[index];
  }
  
  return null;
}

async function getCampaign(jobId) {
  const data = await readCampaigns();
  return data.campaigns.find(c => c.jobId === jobId);
}

// Browser pool management
async function createBrowser() {
  const browser = await chromium.launch({
    headless: false, // Non-headless as requested
    args: [
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-extensions',
      '--disable-plugins',
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

// Process single visitor
async function processVisitor(url, dwellMs, jobId) {
  let browser = null;
  let context = null;
  
  try {
    // Check memory before creating browser
    const memory = getMemoryUsage();
    if (memory.rss > CONFIG.MAX_MEMORY_MB) {
      console.warn(`⚠️ Memory limit reached (${memory.rss}MB), waiting...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    browser = await createBrowser();
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    // Navigate to URL
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Simulate human behavior
    await page.waitForTimeout(Math.random() * 2000 + 1000);
    
    // Scroll
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    await page.waitForTimeout(dwellMs / 2);
    
    // Try to click a random link for multi-page visit
    try {
      const links = await page.$$('a[href^="http"], a[href^="/"]');
      if (links.length > 0) {
        const randomLink = links[Math.floor(Math.random() * links.length)];
        await randomLink.click({ timeout: 5000 });
        await page.waitForTimeout(dwellMs / 2);
        
        // Update pages visited
        await updateCampaign(jobId, {
          pagesVisited: (await getCampaign(jobId))?.pagesVisited + 1 || 1,
        });
      }
    } catch (err) {
      // Link click failed, that's okay
    }
    
    await closeBrowser(browser);
    
    // Update completed count
    const campaign = await getCampaign(jobId);
    await updateCampaign(jobId, {
      completed: (campaign?.completed || 0) + 1,
      pagesVisited: (campaign?.pagesVisited || 0) + 1,
    });
    
    return { success: true };
    
  } catch (err) {
    console.error(`Visitor failed: ${err.message}`);
    
    if (browser) {
      await closeBrowser(browser);
    }
    
    // Update failed count
    const campaign = await getCampaign(jobId);
    await updateCampaign(jobId, {
      failed: (campaign?.failed || 0) + 1,
    });
    
    return { success: false, error: err.message };
  }
}

// Process campaign in batches
async function processCampaignInBatches(jobId, urls, dwellMs) {
  const totalVisitors = urls.length;
  const batchSize = CONFIG.BATCH_SIZE;
  
  console.log(`[Campaign ${jobId}] Starting ${totalVisitors} visitors in batches of ${batchSize}`);
  
  for (let i = 0; i < totalVisitors; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalVisitors / batchSize);
    
    console.log(`[Campaign ${jobId}] Processing batch ${batchNumber}/${totalBatches} (${batch.length} visitors)`);
    
    // Process batch concurrently
    const promises = batch.map(url => processVisitor(url, dwellMs, jobId));
    await Promise.all(promises);
    
    // Small delay between batches
    if (i + batchSize < totalVisitors) {
      console.log(`[Campaign ${jobId}] Batch ${batchNumber} complete, pausing 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Mark campaign as completed
  await updateCampaign(jobId, { status: 'completed' });
  activeCampaigns.delete(jobId);
  
  console.log(`[Campaign ${jobId}] ✅ Campaign completed!`);
}

// API Endpoints

// Start campaign
app.post('/api/campaign/start', async (req, res) => {
  try {
    const { urls, dwellMs = 30000 } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Invalid URLs array' });
    }
    
    const jobId = Date.now().toString();
    const targetUrl = urls[0];
    
    // Save campaign
    await saveCampaign({
      jobId,
      targetUrl,
      visitors: urls.length,
      dwellMs,
    });
    
    activeCampaigns.set(jobId, {
      jobId,
      targetUrl,
      total: urls.length,
      status: 'running',
    });
    
    // Start processing in background
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

// Get campaign results
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

// List campaigns
app.get('/campaigns', async (req, res) => {
  try {
    const data = await readCampaigns();
    res.json({ campaigns: data.campaigns.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
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

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  for (const browser of browserPool) {
    await closeBrowser(browser);
  }
  process.exit(0);
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Optimized Playwright Server running on port ${PORT}`);
  console.log(`📊 Max concurrent browsers: ${CONFIG.MAX_CONCURRENT_BROWSERS}`);
  console.log(`📦 Batch size: ${CONFIG.BATCH_SIZE}`);
  console.log(`💾 Memory limit: ${CONFIG.MAX_MEMORY_MB}MB`);
});
