// src/config.js

/**
 * Default server configuration.
 *
 * IMPORTANT:
 * For local development, you can point this to your local server.
 * For production, this should point to your live API endpoint.
 *
 * It's recommended to use environment variables for sensitive data
 * like API keys, but for simplicity, we're hardcoding them here.
 */
export const DEFAULT_SERVER_CONFIG = {
  host: 'api.organitrafficboost.com',
  port: 443,
  useHttps: true,
  apiKey: 'm7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp',
};

/**
 * Default parameters for new campaigns.
 */
export const CAMPAIGN_DEFAULTS = {
  dwellMs: 15000,
  scroll: true,
  urls: 'https://www.google.com/search?q=playwright\nhttps://playwright.dev/',
};

/**
 * Available browser profiles for traffic generation.
 */
export const BROWSER_PROFILES = [
  { id: 'chrome', name: 'Google Chrome' },
  { id: 'firefox', name: 'Mozilla Firefox' },
  { id: 'safari', name: 'Apple Safari' },
  // Add more profiles as needed
];