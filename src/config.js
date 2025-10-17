// src/config.js

// Default server configuration
export const DEFAULT_SERVER_CONFIG = {
  host: 'api.organitrafficboost.com',
  port: 443,
  useHttps: true,
  apiKey: 'm7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp',
};

// Campaign defaults
export const CAMPAIGN_DEFAULTS = {
  dwellMs: 15000,
  scroll: true,
  headless: true,
};

// Helper function to build server URL
export function getServerUrl(config = DEFAULT_SERVER_CONFIG) {
  const protocol = config.useHttps ? 'https' : 'http';
  const port = config.port && config.port !== 80 && config.port !== 443 ? `:${config.port}` : '';
  return `${protocol}://${config.host}${port}`;
}

// Legacy CONFIG export for backward compatibility
const CONFIG = {
  API_BASE: import.meta.env.VITE_API_BASE || getServerUrl(DEFAULT_SERVER_CONFIG),
  REQUEST_TIMEOUT_MS: 30000,
};

export default CONFIG;