// src/api.js
import CONFIG, { DEFAULT_SERVER_CONFIG, getServerUrl } from './config';

// Helper to build API URL from server config
function getApiBase(serverConfig = DEFAULT_SERVER_CONFIG) {
  return getServerUrl(serverConfig);
}

// Fetch with timeout and error handling
async function fetchJSON(path, opts = {}, serverConfig = DEFAULT_SERVER_CONFIG) {
  const apiBase = getApiBase(serverConfig);
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), CONFIG.REQUEST_TIMEOUT_MS || 30000);
  
  try {
    const res = await fetch(`${apiBase}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': serverConfig.apiKey || DEFAULT_SERVER_CONFIG.apiKey,
        ...(opts.headers || {}),
      },
      signal: ctrl.signal,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText} ${text}`);
    }
    
    return await res.json();
  } finally {
    clearTimeout(to);
  }
}

// API Functions
export async function checkServerHealth(serverConfig = DEFAULT_SERVER_CONFIG) {
  return fetchJSON('/health', { method: 'GET' }, serverConfig);
}

export async function startCampaign(payload, serverConfig = DEFAULT_SERVER_CONFIG) {
  return fetchJSON('/api/campaign/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, serverConfig);
}

export async function checkCampaignStatus(id, serverConfig = DEFAULT_SERVER_CONFIG) {
  return fetchJSON(`/status/${encodeURIComponent(id)}`, { method: 'GET' }, serverConfig);
}

export async function getCampaignResults(id, serverConfig = DEFAULT_SERVER_CONFIG) {
  return fetchJSON(`/results/${encodeURIComponent(id)}`, { method: 'GET' }, serverConfig);
}

export async function stopCampaign(id, serverConfig = DEFAULT_SERVER_CONFIG) {
  return fetchJSON(`/stop/${encodeURIComponent(id)}`, {
    method: 'POST',
  }, serverConfig);
}

export async function listCampaigns(serverConfig = DEFAULT_SERVER_CONFIG) {
  return fetchJSON('/campaigns', { method: 'GET' }, serverConfig);
}

// Helper functions
export function handleApiError(error) {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

export function validateServerConfig(config) {
  if (!config?.host) return false;
  if (typeof config.port !== 'number') return false;
  return true;
}

export function buildCampaignRequest({ urls, dwellMs = 15000, scroll = true, ...rest }) {
  return {
    urls: Array.isArray(urls) ? urls : [urls],
    dwellMs: Math.max(5000, Number(dwellMs) || 15000),
    scroll: Boolean(scroll),
    ...rest,
  };
}

// Re-export getServerUrl for convenience
export { getServerUrl };

// Legacy default export
export default {
  health: checkServerHealth,
  startRun: startCampaign,
  checkStatus: checkCampaignStatus,
  getResults: getCampaignResults,
  stop: stopCampaign,
  list: listCampaigns,
};