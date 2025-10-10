// VPS Server Configuration Only
export const API_BASE = "http://67.217.60.57:3000";
export const API_KEY = "m7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp";

// Server configuration - VPS only
export const getServerConfig = () => {
  return {
    apiBase: API_BASE,
    apiKey: API_KEY,
    host: "67.217.60.57",
    port: "3000",
    useHttps: false,
    isLocal: false
  };
};

// Default server configuration for Campaign component
export const DEFAULT_SERVER_CONFIG = {
  host: "67.217.60.57",
  port: "3000",
  apiKey: API_KEY,
  useHttps: false
};

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  RUN: '/run',
  STATUS: '/status',
  RESULTS: '/results',
  STOP: '/stop',
  PING: '/ping'
};

// Campaign defaults
export const CAMPAIGN_DEFAULTS = {
  dwellMs: 8000,
  scroll: true,
  naturalScrolling: true,
  randomDelay: true,
  mouseMovements: true,
  screenshots: true,
  videoRecording: false,
  incognito: true,
  maxClicks: 5,
  enableGoogleSearch: true,
  enableInternalNavigation: true,
  profile: 'Desktop Chrome'
};

// Server status cache - VPS only
let serverStatusCache = {
  vps: { online: false, lastCheck: null }
};

export const getServerStatusCache = () => serverStatusCache;
export const updateServerStatusCache = (type, status) => {
  if (type === 'vps') {
    serverStatusCache.vps = {
      online: status,
      lastCheck: new Date().toISOString()
    };
  }
};