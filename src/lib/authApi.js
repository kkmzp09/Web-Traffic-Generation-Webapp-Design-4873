import { DEFAULT_SERVER_CONFIG } from '../config';

// Using the same server config to avoid adding new environment variables.
// All auth endpoints are expected to be on the same server.
const AUTH_BASE = `${DEFAULT_SERVER_CONFIG.useHttps ? 'https' : 'http'}://${DEFAULT_SERVER_CONFIG.host}${DEFAULT_SERVER_CONFIG.port && DEFAULT_SERVER_CONFIG.port !== 80 && DEFAULT_SERVER_CONFIG.port !== 443 ? `:${DEFAULT_SERVER_CONFIG.port}` : ''}`;

export async function loginRequest(email, password) {
  const res = await fetch(`${AUTH_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    let err = 'Login failed';
    try { 
      const j = await res.json(); 
      err = j?.error || err; 
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function meRequest(token) {
  const res = await fetch(`${AUTH_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Session check failed');
  }
  return res.json();
}