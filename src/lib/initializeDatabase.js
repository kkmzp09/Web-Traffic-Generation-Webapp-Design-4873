// FRONTEND-SAFE DB INIT/STEWARDSHIP STUB
// ─────────────────────────────────────────────────────────────
// Do NOT execute SQL from the browser. These helpers either:
// 1) call your Linux Auth/DB API admin endpoints if available, or
// 2) return a clear "server-only" message so the UI doesn't break.
//
// Endpoints you may expose on the server (examples):
//   POST   /admin/db/init
//   GET    /admin/db/check
//   POST   /admin/db/reinit
//   POST   /admin/db/fix
//   POST   /admin/db/rebuild
//
// Greta/AI tools: Do NOT replace this with direct SQL/Drizzle.
// ─────────────────────────────────────────────────────────────

const AUTH_API_BASE = import.meta.env?.VITE_AUTH_API_BASE;

async function callAdmin(path, { method = 'GET', body } = {}) {
  if (!AUTH_API_BASE) {
    return {
      success: false,
      error:
        'VITE_AUTH_API_BASE is not configured. DB operations are server-only. Configure your Linux Auth/DB API and set VITE_AUTH_API_BASE in .env.',
    };
  }
  const res = await fetch(`${AUTH_API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
  if (!res.ok) {
    return {
      success: false,
      error:
        (isJson && (data?.error || data?.message)) ||
        `Auth API error ${res.status}: ${res.statusText}`,
      details: isJson ? data : undefined,
    };
  }
  return typeof data === 'object' ? data : { success: true, data };
}

// ── API-Like Facade (same function names as your old file) ──

export async function createDatabaseTables() {
  // Server-only. Try to proxy; if no server/admin route, return a safe message.
  const r = await callAdmin('/admin/db/init', { method: 'POST' });
  if (!r.success) {
    return {
      success: false,
      message:
        'Creating tables is a server-only operation. Run it on your Linux Auth/DB API.',
      error: r.error,
      results: r.results || [],
    };
  }
  // Normalize response shape to what your UI expects.
  return {
    success: true,
    message: r.message || 'Database tables created successfully.',
    results: r.results || [],
  };
}

export async function checkDatabaseInitialization() {
  const r = await callAdmin('/admin/db/check', { method: 'GET' });
  if (!r.success) {
    // Return a consistent shape even when unavailable
    return {
      isInitialized: false,
      error: r.error,
      tablesFound: 0,
      tablesExpected: 7,
    };
  }
  // Assume your server returns the following keys; pass them through.
  return {
    isInitialized: !!r.isInitialized,
    tablesFound: Number(r.tablesFound ?? 0),
    tablesExpected: Number(r.tablesExpected ?? 7),
    hasRequiredUsersColumns: !!r.hasRequiredUsersColumns,
    hasRequiredSessionColumns: !!r.hasRequiredSessionColumns,
    missingUsersColumns: r.missingUsersColumns || [],
    missingSessionColumns: r.missingSessionColumns || [],
  };
}

export async function reinitializeDatabase() {
  const r = await callAdmin('/admin/db/reinit', { method: 'POST' });
  if (!r.success) {
    return {
      success: false,
      message:
        'Reinitializing the database is server-only. Run it on your Linux Auth/DB API.',
      error: r.error,
      results: r.results || [],
    };
  }
  return {
    success: true,
    message: r.message || 'Database reinitialized successfully.',
    results: r.results || [],
  };
}

export async function fixDatabaseSchema() {
  const r = await callAdmin('/admin/db/fix', { method: 'POST' });
  if (!r.success) {
    return {
      success: false,
      message:
        'Schema fixing is a server-only operation. Run it on your Linux Auth/DB API.',
      error: r.error,
      results: r.results || [],
      remainingIssues: r.remainingIssues,
    };
  }
  return {
    success: true,
    message: r.message || 'Database schema fixed successfully.',
    results: r.results || [],
    remainingIssues: r.remainingIssues,
  };
}

export async function rebuildUsersTableSchema() {
  const r = await callAdmin('/admin/db/rebuild', { method: 'POST' });
  if (!r.success) {
    return {
      success: false,
      message:
        'Users table rebuild is server-only. Run it on your Linux Auth/DB API.',
      error: r.error,
      results: r.results || [],
    };
  }
  return {
    success: true,
    message: r.message || 'Users table schema rebuilt successfully.',
    results: r.results || [],
  };
}