// src/lib/queries.js
// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND STUB — do not perform queries from the browser.
// This file is a hard stub that returns mock data for development.
// All actual queries must be implemented on the server and called via fetch.
// ─────────────────────────────────────────────────────────────────────────────

// Mock data for offline/development mode
const getMockCampaigns = () => [
  {
    id: 'demo-campaign-1',
    name: 'Demo Campaign (Mock Data)',
    targetUrl: 'https://example.com',
    status: 'active',
    trafficRate: 30,
    totalRequests: 1250,
    successfulRequests: 1180,
    failedRequests: 70,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: 'demo-campaign-2',
    name: 'Inactive Campaign (Mock Data)',
    targetUrl: 'https://demo-site.com',
    status: 'inactive',
    trafficRate: 15,
    totalRequests: 890,
    successfulRequests: 845,
    failedRequests: 45,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
];

const getMockStats = () => ({
  totalRequests: 2140,
  successfulRequests: 2025,
  failedRequests: 115,
});

const getMockActivity = () => [
  {
    id: 'activity-1',
    campaignId: 'demo-campaign-1',
    campaignName: 'Demo Campaign (Mock Data)',
    requestUrl: 'https://example.com',
    statusCode: 200,
    success: true,
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: 'activity-2',
    campaignId: 'demo-campaign-2',
    campaignName: 'Inactive Campaign (Mock Data)',
    requestUrl: 'https://demo-site.com',
    statusCode: 404,
    success: false,
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
  },
];

const returnMock = (data) => {
  if (import.meta.env?.DEV) {
    return data;
  }
  // In a real app, this would fetch from an API. For now, return empty/default values.
  console.warn('This function is returning mock data or an empty value in production.');
  return Array.isArray(data) ? [] : null;
};


// --- Campaign queries ---
export const createCampaign = async (campaignData) => {
  console.log('Frontend Stub: createCampaign called with', campaignData);
  return returnMock({ id: `demo-${Date.now()}`, ...campaignData, createdAt: new Date() });
};

export const getCampaigns = async (userId = null, limit = 50) => {
  console.log(`Frontend Stub: getCampaigns(userId=${userId}, limit=${limit})`);
  return returnMock(getMockCampaigns());
};

export const getCampaignById = async (id) => {
  console.log(`Frontend Stub: getCampaignById(id=${id})`);
  return returnMock(getMockCampaigns().find((c) => c.id === id) || null);
};

export const updateCampaign = async (id, updates) => {
  console.log(`Frontend Stub: updateCampaign(id=${id})`, updates);
  return returnMock({ id, ...updates });
};

export const deleteCampaign = async (id) => {
  console.log(`Frontend Stub: deleteCampaign(id=${id})`);
  return true;
};


// --- Traffic log queries ---
export const logTrafficRequest = async (logData) => {
  return returnMock({ id: `log-${Date.now()}`, ...logData, timestamp: new Date() });
};

export const getTrafficLogs = async (campaignId, limit = 100) => {
  console.log(`Frontend Stub: getTrafficLogs(campaignId=${campaignId})`);
  return returnMock([]);
};

export const getTrafficRequests = getTrafficLogs; // Alias for backward compatibility


// --- Analytics queries ---
export const getCampaignStats = async (campaignId, startDate, endDate) => {
  console.log(`Frontend Stub: getCampaignStats(campaignId=${campaignId})`);
  return returnMock({ totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgResponseTime: 0 });
};

export const getOverallStats = async (startDate, endDate) => {
  console.log('Frontend Stub: getOverallStats');
  return returnMock({ totalRequests: 0, successfulRequests: 0, failedRequests: 0, uniqueCampaigns: 0, avgResponseTime: 0 });
};


// --- User settings queries ---
export const getUserSettings = async (userId) => {
  console.log(`Frontend Stub: getUserSettings(userId=${userId})`);
  return returnMock(null);
};

export const createOrUpdateUserSettings = async (userId, settingsData) => {
  console.log(`Frontend Stub: createOrUpdateUserSettings(userId=${userId})`, settingsData);
  return returnMock({ userId, ...settingsData, id: `settings-${Date.now()}` });
};


// --- Dashboard data ---
export const getDashboardData = async (userId = null) => {
  console.log(`Frontend Stub: getDashboardData(userId=${userId})`);
  if (import.meta.env?.DEV) {
    return {
        stats: getMockStats(),
        activeCampaigns: getMockCampaigns().filter(c => c.status === 'active'),
        recentActivity: getMockActivity()
      };
  }
  return {
    stats: { totalRequests: 0, successfulRequests: 0, failedRequests: 0 },
    activeCampaigns: [],
    recentActivity: [],
  };
};

// --- Traffic analysis queries ---
export const getTrafficAnalytics = async (campaignId, timeRange = '24h') => {
  console.log(`Frontend Stub: getTrafficAnalytics(campaignId=${campaignId})`);
  return {
      stats: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0 },
      countryStats: [],
      hourlyStats: []
    };
};

// --- Device fingerprint queries ---
export const getDeviceFingerprintStats = async (campaignId, timeRange = '24h') => {
  console.log(`Frontend Stub: getDeviceFingerprintStats(campaignId=${campaignId})`);
  return { deviceTypeStats: [] };
};