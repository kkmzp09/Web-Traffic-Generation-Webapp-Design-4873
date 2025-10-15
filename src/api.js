// src/api.js
import CONFIG from './config';

async function fetchJSON(path, opts = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), CONFIG.REQUEST_TIMEOUT_MS || 30000);
  try {
    const res = await fetch(`${CONFIG.API_BASE}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
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

export default {
  health() {
    // GET https://api.organitrafficboost.com/health
    return fetchJSON('/health', { method: 'GET' });
  },
  startRun({ urls, dwellMs = 5000, scroll = true }) {
    // POST https://api.organitrafficboost.com/run
    return fetchJSON('/run', {
      method: 'POST',
      body: JSON.stringify({ urls, dwellMs, scroll }),
    });
  },
};