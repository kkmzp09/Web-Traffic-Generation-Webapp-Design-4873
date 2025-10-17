// vps-campaign-tracker.js
// Add this to your VPS relay server to track campaigns in a simple JSON file
// Upload this file to your VPS and integrate with your relay server

const fs = require('fs').promises;
const path = require('path');

const CAMPAIGNS_FILE = path.join(__dirname, 'campaigns.json');
const MAX_AGE_DAYS = 7;

// Initialize campaigns file
async function initCampaignsFile() {
  try {
    await fs.access(CAMPAIGNS_FILE);
  } catch {
    await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify({ campaigns: [] }, null, 2));
  }
}

// Read campaigns
async function readCampaigns() {
  try {
    const data = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { campaigns: [] };
  }
}

// Write campaigns
async function writeCampaigns(data) {
  await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(data, null, 2));
}

// Clean old campaigns (older than 7 days)
async function cleanOldCampaigns() {
  const data = await readCampaigns();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);
  
  data.campaigns = data.campaigns.filter(c => new Date(c.createdAt) > cutoffDate);
  await writeCampaigns(data);
}

// Save campaign
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
    updatedAt: new Date().toISOString()
  });
  
  await writeCampaigns(data);
  await cleanOldCampaigns();
  
  return data.campaigns[0];
}

// Update campaign
async function updateCampaign(jobId, updates) {
  const data = await readCampaigns();
  const index = data.campaigns.findIndex(c => c.jobId === jobId);
  
  if (index !== -1) {
    data.campaigns[index] = {
      ...data.campaigns[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeCampaigns(data);
    return data.campaigns[index];
  }
  
  return null;
}

// Get campaign
async function getCampaign(jobId) {
  const data = await readCampaigns();
  return data.campaigns.find(c => c.jobId === jobId);
}

// List campaigns
async function listCampaigns(limit = 50) {
  await cleanOldCampaigns();
  const data = await readCampaigns();
  return data.campaigns.slice(0, limit);
}

// Express middleware to add to your relay server
function campaignTrackingMiddleware(app) {
  // Save campaign when started
  app.post('/api/campaign/start', async (req, res, next) => {
    const originalSend = res.json.bind(res);
    
    res.json = async function(data) {
      if (data.jobId && req.body.urls && req.body.urls.length > 0) {
        try {
          await saveCampaign({
            jobId: data.jobId,
            targetUrl: req.body.urls[0],
            visitors: req.body.urls.length,
            dwellMs: req.body.dwellMs || 15000
          });
        } catch (err) {
          console.error('[Campaign Tracker] Failed to save campaign:', err);
        }
      }
      return originalSend(data);
    };
    
    next();
  });

  // Get campaign results
  app.get('/results/:id', async (req, res) => {
    try {
      const campaign = await getCampaign(req.params.id);
      if (campaign) {
        res.json({
          jobId: campaign.jobId,
          total: campaign.visitors,
          completed: campaign.completed,
          failed: campaign.failed,
          inProgress: campaign.visitors - campaign.completed - campaign.failed,
          pagesVisited: campaign.pagesVisited,
          status: campaign.status
        });
      } else {
        res.status(404).json({ error: 'Campaign not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to get campaign results' });
    }
  });

  // List campaigns
  app.get('/campaigns', async (req, res) => {
    try {
      const campaigns = await listCampaigns();
      res.json({ campaigns });
    } catch (err) {
      res.status(500).json({ error: 'Failed to list campaigns' });
    }
  });

  // Update campaign status (called by playwright server)
  app.post('/campaigns/:id/update', async (req, res) => {
    try {
      const updated = await updateCampaign(req.params.id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: 'Campaign not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  });
}

module.exports = {
  initCampaignsFile,
  saveCampaign,
  updateCampaign,
  getCampaign,
  listCampaigns,
  campaignTrackingMiddleware
};
