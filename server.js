const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: false
}));

// Parse JSON bodies
app.use(express.json());

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const expectedKey = 'm7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp';
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Store running campaigns
const campaigns = new Map();

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    server: 'Local Development Server',
    campaigns: campaigns.size
  });
});

// Ping endpoint (no auth required)
app.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

// Status endpoint (no auth required)
app.get('/status', (req, res) => {
  res.json({ 
    status: 'running', 
    activeCampaigns: campaigns.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start campaign endpoint
app.post('/run', validateApiKey, (req, res) => {
  try {
    const { urls, dwellMs = 8000, scroll = true, ...options } = req.body;
    
    if (!urls || (Array.isArray(urls) && urls.length === 0)) {
      return res.status(400).json({ error: 'URLs are required' });
    }
    
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const urlList = Array.isArray(urls) ? urls : [urls];
    
    // Simulate campaign creation
    const campaign = {
      id: campaignId,
      urls: urlList,
      dwellMs,
      scroll,
      status: 'running',
      startTime: new Date().toISOString(),
      visitCount: 0,
      totalVisits: options.trafficAmount || 100,
      ...options
    };
    
    campaigns.set(campaignId, campaign);
    
    // Start simulated traffic generation
    simulateTrafficGeneration(campaignId);
    
    res.json({
      success: true,
      id: campaignId,
      sessionId: campaignId,
      message: 'Campaign started successfully',
      campaign: {
        id: campaignId,
        urls: urlList,
        status: 'running',
        startTime: campaign.startTime
      }
    });
    
  } catch (error) {
    console.error('Campaign start error:', error);
    res.status(500).json({ 
      error: 'Failed to start campaign',
      details: error.message 
    });
  }
});

// Get campaign status
app.get('/status/:campaignId', validateApiKey, (req, res) => {
  const { campaignId } = req.params;
  const campaign = campaigns.get(campaignId);
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  res.json({
    id: campaignId,
    status: campaign.status,
    visitCount: campaign.visitCount,
    totalVisits: campaign.totalVisits,
    progress: Math.min((campaign.visitCount / campaign.totalVisits) * 100, 100),
    startTime: campaign.startTime,
    urls: campaign.urls
  });
});

// Get campaign results
app.get('/results/:campaignId', validateApiKey, (req, res) => {
  const { campaignId } = req.params;
  const campaign = campaigns.get(campaignId);
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  res.json({
    id: campaignId,
    status: campaign.status,
    results: {
      totalVisits: campaign.visitCount,
      targetVisits: campaign.totalVisits,
      successRate: '98.5%',
      averageDwellTime: `${campaign.dwellMs}ms`,
      urls: campaign.urls,
      startTime: campaign.startTime,
      endTime: campaign.status === 'completed' ? campaign.endTime : null
    }
  });
});

// Stop campaign
app.post('/stop/:campaignId', validateApiKey, (req, res) => {
  const { campaignId } = req.params;
  const campaign = campaigns.get(campaignId);
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  campaign.status = 'stopped';
  campaign.endTime = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Campaign stopped successfully',
    id: campaignId,
    finalStats: {
      visitCount: campaign.visitCount,
      totalVisits: campaign.totalVisits,
      status: 'stopped'
    }
  });
});

// List all campaigns
app.get('/campaigns', validateApiKey, (req, res) => {
  const campaignList = Array.from(campaigns.values()).map(campaign => ({
    id: campaign.id,
    status: campaign.status,
    visitCount: campaign.visitCount,
    totalVisits: campaign.totalVisits,
    startTime: campaign.startTime,
    urls: campaign.urls.slice(0, 1) // Only show first URL
  }));
  
  res.json({
    campaigns: campaignList,
    total: campaignList.length
  });
});

// Simulate traffic generation
function simulateTrafficGeneration(campaignId) {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return;
  
  const interval = setInterval(() => {
    if (campaign.status !== 'running') {
      clearInterval(interval);
      return;
    }
    
    // Simulate visits
    const increment = Math.floor(Math.random() * 3) + 1;
    campaign.visitCount = Math.min(campaign.visitCount + increment, campaign.totalVisits);
    
    // Check if completed
    if (campaign.visitCount >= campaign.totalVisits) {
      campaign.status = 'completed';
      campaign.endTime = new Date().toISOString();
      clearInterval(interval);
      console.log(`Campaign ${campaignId} completed with ${campaign.visitCount} visits`);
    }
    
  }, 2000); // Update every 2 seconds
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Handle 404s
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/ping', '/status', '/run', '/status/:id', '/results/:id', '/stop/:id', '/campaigns']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Traffic Generation Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key required for most endpoints`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /health - Server health check`);
  console.log(`   GET  /ping - Simple ping test`);
  console.log(`   GET  /status - Server status`);
  console.log(`   POST /run - Start campaign`);
  console.log(`   GET  /status/:id - Campaign status`);
  console.log(`   GET  /results/:id - Campaign results`);
  console.log(`   POST /stop/:id - Stop campaign`);
  console.log(`   GET  /campaigns - List campaigns`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});