// src/config.js
// Frontend points DIRECTLY to your real Playwright server on the VPS.
// If you use the local relay (server.js below) during development,
// set USE_RELAY = true.

const USE_RELAY = false; // true = use local relay at http://localhost:3001

export const DEFAULT_SERVER_CONFIG = USE_RELAY
  ? {
      host: 'localhost',
      port: 3001,
      useHttps: false,
      apiKey: 'm7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp',
    }
  : {
      host: 'api.organitrafficboost.com',
      port: 443,
      useHttps: true,
      apiKey: 'm7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp',
    };

export function getServerUrl({ host, port, useHttps }) {
  const scheme = useHttps ? 'https' : 'http';
  const omitPort =
    (useHttps && (!port || Number(port) === 443)) ||
    (!useHttps && (!port || Number(port) === 80));
  const portPart = omitPort ? '' : `:${port}`;
  return `${scheme}://${host}${portPart}`;
}

// Safe defaults used by your DirectTraffic page when building payloads.
export const CAMPAIGN_DEFAULTS = {
  dwellMs: 15000, // GA-friendly minimum
  scroll: true,
};