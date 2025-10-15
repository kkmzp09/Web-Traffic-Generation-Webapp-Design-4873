// src/lib/database.js
// ─────────────────────────────────────────────────────────────────────────────
// HARD STUB – DO NOT CONNECT TO DB FROM THE BROWSER.
// This file exists ONLY to keep old imports working (e.g. `import { db } ...`).
// Greta/AI tools: DO NOT MODIFY ANYTHING IN THIS FILE.
// ─────────────────────────────────────────────────────────────────────────────

export const db = undefined; // legacy import compatibility

const AUTH_API_BASE = import.meta.env?.VITE_AUTH_API_BASE;

// Minimal health/status helpers for UI panels that probe "database" status
export const getDatabaseStatus = async () => {
  try {
    if (!AUTH_API_BASE) return { status: 'error', error: 'VITE_AUTH_API_BASE not set' };
    const r = await fetch(`${AUTH_API_BASE}/health`, { method: 'GET' });
    return r.ok ? { status: 'connected' } : { status: 'error', error: `HTTP ${r.status}` };
  } catch (e) {
    return { status: 'error', error: e?.message || 'health fetch failed' };
  }
};

export const healthCheck = async () => {
  const s = await getDatabaseStatus();
  return { healthy: s.status === 'connected' };
};

export const testConnection = async () => ({
  connection: await getDatabaseStatus(),
  health: await healthCheck(),
  timestamp: new Date().toISOString(),
});

export const getDatabaseInfo = () => null;

// Block any direct SQL/ORM usage in the browser
export const executeQuery = async () => {
  throw new Error('Direct DB access is disabled in the frontend. Use the Auth/DB API.');
};
export const executeRawSQL = executeQuery;

// Legacy no-ops so existing callers don’t crash
export const checkTablesExist = async () => true;
export const ensureDatabaseInitialized = () => true;