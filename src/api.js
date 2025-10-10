// src/api.js
import { DEFAULT_SERVER_CONFIG, CAMPAIGN_DEFAULTS } from './config';

/** Custom error for API failures */
class ApiError extends Error {
  constructor(status, body, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Build base URL from config */
export const getServerUrl = (config = DEFAULT_SERVER_CONFIG) => {
  const protocol = config.useHttps ? 'https' : 'http';
  const omitPort =
    (config.useHttps && (!config.port || Number(config.port) === 443)) ||
    (!config.useHttps && (!config.port || Number(config.port) === 80));
  const portPart = omitPort ? '' : `:${config.port}`;
  return `${protocol}://${config.host}${portPart}`;
};

/**
 * Fetch wrapper that:
 *  - prefixes the base URL
 *  - injects Content-Type + x-api-key
 *  - normalizes errors
 */
const apiFetch = async (endpoint, options = {}, serverConfig = DEFAULT_SERVER_CONFIG) => {
  const url = getServerUrl(serverConfig) + endpoint;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Only add API key if configured
  if (serverConfig.apiKey) {
    headers['x-api-key'] = serverConfig.apiKey;
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (e) {
    // Network / DNS / TLS issues etc.
    throw new ApiError(503, { error: 'Service Unavailable' }, `Network error calling ${endpoint}`);
  }

  // Try to parse JSON (even on errors)
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (response.status !== 204 && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      // fall through with null data
    }
  }

  if (!response.ok) {
    const body = data || { error: `HTTP ${response.status}` };
    throw new ApiError(response.status, body, `API request to ${endpoint} failed`);
  }

  return data;
};

/* ------------------------
 * Public API methods
 * ----------------------*/

export const startCampaign = (payload, serverConfig = DEFAULT_SERVER_CONFIG) => {
  // Backend: POST /run  -> { id, status }
  return apiFetch('/run', { method: 'POST', body: JSON.stringify(payload) }, serverConfig);
};

export const checkCampaignStatus = (id, serverConfig = DEFAULT_SERVER_CONFIG) => {
  // Backend: GET /status/:id -> { id, status, total, done, progress }
  return apiFetch(`/status/${encodeURIComponent(id)}`, {}, serverConfig);
};

export const getCampaignResults = (id, serverConfig = DEFAULT_SERVER_CONFIG) => {
  // Backend: GET /results/:id -> { id, results }
  return apiFetch(`/results/${encodeURIComponent(id)}`, {}, serverConfig);
};

export const stopCampaign = (id, serverConfig = DEFAULT_SERVER_CONFIG) => {
  // Backend: POST /stop/:id
  return apiFetch(`/stop/${encodeURIComponent(id)}`, { method: 'POST' }, serverConfig);
};

export const checkServerHealth = (serverConfig = DEFAULT_SERVER_CONFIG) => {
  // Backend: GET /health (no auth required)
  return apiFetch('/health', {}, serverConfig);
};

/* ------------------------
 * Helpers (builder/validation/error)
 * ----------------------*/

/**
 * Build a payload accepted by your backend Campaign schema:
 * { urls: string[], dwellMs?: number, scroll?: boolean, actions?: [], userAgent?: string }
 */
export const buildCampaignRequest = ({ urls, dwellMs, scroll, advancedSettings, user }) => {
  const list =
    typeof urls === 'string'
      ? urls.split('\n').map(s => s.trim()).filter(Boolean)
      : Array.isArray(urls)
        ? urls.map(s => String(s).trim()).filter(Boolean)
        : [];

  const payload = {
    urls: list,
    dwellMs: Number(dwellMs ?? CAMPAIGN_DEFAULTS.dwellMs),
    scroll: Boolean(scroll ?? CAMPAIGN_DEFAULTS.scroll),
  };

  if (advancedSettings?.userAgent) payload.userAgent = advancedSettings.userAgent;
  if (advancedSettings?.actions && Array.isArray(advancedSettings.actions)) {
    payload.actions = advancedSettings.actions;
  }

  if (user?.id) payload.userId = user.id;

  return payload;
};

export const validateServerConfig = (cfg = DEFAULT_SERVER_CONFIG) => {
  const errors = [];
  if (!cfg?.host) errors.push('API Host is required.');
  if (cfg?.host && !/^[a-zA-Z0-9.-]+$/.test(cfg.host)) errors.push('Invalid API Host format.');
  if (cfg?.port && Number.isNaN(Number(cfg.port))) errors.push('Port must be a number.');
  return { isValid: errors.length === 0, errors };
};

/** Standardized error -> user-facing string */
export const handleApiError = (err, context = 'API') => {
  if (err instanceof ApiError) {
    const msg = err.body?.error || err.message || 'Unknown error';
    if (err.status === 401) {
      return `${context}: 401 Unauthorized. Check your API key in Settings.`;
    }
    return `${context}: ${err.status} ${msg}`;
  }
  return `${context}: Network error or server unavailable.`;
};

export default {
  getServerUrl,
  startCampaign,
  checkCampaignStatus,
  getCampaignResults,
  stopCampaign,
  checkServerHealth,
  buildCampaignRequest,
  validateServerConfig,
  handleApiError,
};