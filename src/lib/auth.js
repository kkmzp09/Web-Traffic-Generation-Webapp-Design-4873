// src/lib/auth.js
// Frontend auth client that talks to the Linux Auth/DB API
// Requires: VITE_AUTH_API_BASE in .env (e.g. https://auth.organitrafficboost.com)

const AUTH_API_BASE = import.meta.env?.VITE_AUTH_API_BASE || 'https://auth.organitrafficboost.com';

console.log('🔍 AUTH_API_BASE loaded:', AUTH_API_BASE);

if (!import.meta.env?.VITE_AUTH_API_BASE) {
  console.warn('VITE_AUTH_API_BASE is not set; using fallback:', AUTH_API_BASE);
}

const STORAGE_KEY = 'authSession'; // { user, token, expiresAt }

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function authHeaders(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// ---- Public API used by AuthContext / components ----

export async function loginUser(email, password) {
  const res = await fetch(`${AUTH_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Login failed (HTTP ${res.status})`);
  }
  const data = await res.json();
  // expected: { user, sessionToken, expiresAt }
  const session = {
    user: data.user,
    token: data.sessionToken,
    expiresAt: data.expiresAt,
  };
  saveSession(session);
  return { user: session.user, sessionToken: session.token };
}

export async function registerUser({ name, email, password }) {
  const res = await fetch(`${AUTH_API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Registration failed (HTTP ${res.status})`);
  }
  // server returns { user }
  return await res.json();
}

export async function logout() {
  // Best effort to inform server (if it exposes /auth/logout)
  try {
    const session = loadSession();
    await fetch(`${AUTH_API_BASE}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(session?.token),
    });
  } catch {
    // ignore
  } finally {
    clearSession();
  }
  return true;
}

export async function getCurrentUser() {
  // 1) Return cached user if token present
  const session = loadSession();
  if (session?.user && session?.token) {
    // Check if session is expired
    if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
      return session.user;
    }
  }

  // 2) Optionally verify by calling /auth/me (if endpoint exists)
  if (session?.token) {
    try {
      const res = await fetch(`${AUTH_API_BASE}/auth/me`, {
        method: 'GET',
        headers: authHeaders(session?.token),
      });
      if (res.ok) {
        const data = await res.json();
        // optional: refresh local cache
        saveSession({
          user: data.user,
          token: session?.token,
          expiresAt: session?.expiresAt,
        });
        return data.user;
      }
    } catch (err) {
      // /auth/me endpoint doesn't exist or failed, fall back to cached session
      console.log('Auth verification skipped, using cached session');
      if (session?.user) return session.user;
    }
  }
  
  return null;
}

// convenience for other code
export function getStoredSession() {
  return loadSession();
}