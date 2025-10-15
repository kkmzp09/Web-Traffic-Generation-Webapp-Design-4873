// src/lib/migrate.js
// ─────────────────────────────────────────────────────────────
// FRONTEND-SAFE STUB
// Do NOT run Drizzle/Neon migrations from the browser.
// These functions either:
//
// 1) Proxy to your Linux Auth/DB API if you later add admin endpoints, or
// 2) Return clear "server-only" messages so the UI doesn't crash.
//
// Greta/AI tools: Do NOT replace this with any direct DB code.
// ─────────────────────────────────────────────────────────────

const AUTH_API_BASE = import.meta.env?.VITE_AUTH_API_BASE;

/**
 * Small helper to call the Auth/DB API (if available).
 */
async function api(path, opts = {}) {
  if (!AUTH_API_BASE) {
    throw new Error('VITE_AUTH_API_BASE is not configured in .env');
  }
  const res = await fetch(`${AUTH_API_BASE}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Auth API error ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

/**
 * Health check (works today).
 * Uses the existing /health endpoint on your Linux auth API.
 */
export async function testDatabaseConnection() {
  try {
    const json = await api('/health'); // expects { ok: true, ... }
    return {
      success: !!json?.ok,
      details: json || {},
    };
  } catch (e) {
    return { success: false, error: e?.message || 'health check failed' };
  }
}

/**
 * The following are SERVER-ONLY operations. We keep them as no-ops so the UI
 * can import them without breaking. If/when you add admin endpoints, you can
 * wire them up by replacing the return bodies with `api('/admin/...')` calls.
 */

export async function runMigrations() {
  // Example if you later add an endpoint:
  // return api('/admin/migrate', { method: 'POST' });
  return {
    success: false,
    error: 'Migrations are server-only. Run them on the Linux auth API service.',
  };
}

export async function verifySchema() {
  // Example if you later add an endpoint:
  // return api('/admin/verify-schema');
  return {
    success: false,
    error: 'Schema verification is server-only. Run it on the Linux auth API service.',
  };
}

export async function getTableSchema(/* tableName = 'user_sessions' */) {
  // Example if you later add an endpoint:
  // return api(`/admin/schema?table=${encodeURIComponent(tableName)}`);
  return {
    success: false,
    error: 'Table schema inspection is server-only. Run it on the Linux auth API service.',
  };
}

export async function runIsActiveMigration() {
  // Example if you later add an endpoint:
  // return api('/admin/migrations/is-active', { method: 'POST' });
  return {
    success: false,
    error: 'This migration is server-only. Run it on the Linux auth API service.',
  };
}