// server.js — Frontend DEV Relay -&gt; Playwright API (domain: api.organitrafficboost.com)
//
// =============================================================================
// ==&gt; IMPORTANT: RUN THIS SERVER FOR LOCAL DEVELOPMENT &lt;==
// In a separate terminal from your frontend (Vite), run:
//   $ node server.js
//
// Your frontend will connect to this server on port 8081, which then relays
// requests to the real API, avoiding CORS issues during development.
// =============================================================================
//
// How to run (local dev):
//   1) npm i express cors compression helmet node-fetch@3 dotenv
//   2) (optional) .env next to this file:
//        PORT=8081
//        API_BASE=https://api.organitrafficboost.com
//        API_KEY=your_actual_api_key
//        REQUEST_TIMEOUT_MS=30000
//        RETRIES=2
//        CORS_ORIGINS=http://localhost:5173,https://organitrafficboost.com
//   3) node server.js
//
// Local relay endpoints your UI can call:
//   POST /run               -&gt; POST   {API_BASE}/api/campaign/start
//   GET  /status/:id        -&gt; GET    {API_BASE}/status/:id
//   GET  /results/:id       -&gt; GET    {API_BASE}/results/:id
//   GET  /health            -&gt; local relay health
//   GET  /upstream/health   -&gt; GET    {API_BASE}/health

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// node-fetch v3 is ESM; use dynamic import in CJS:
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const APP_PORT = Number(process.env.PORT || 8081);

// Corrected API_BASE to point to api.organitrafficboost.com
const API_BASE = (process.env.API_BASE || 'https://api.organitrafficboost.com').replace(/\/+$/, '');
const API_KEY  = process.env.API_KEY || 'm7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp';

const REQUEST_TIMEOUT_MS = Math.max(5000, Number(process.env.REQUEST_TIMEOUT_MS || 30000));
const RETRIES = Math.max(0, Number(process.env.RETRIES || 2));

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://organitrafficboost.com',
  'https://www.organitrafficboost.com',
];
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = envOrigins.length ? envOrigins : DEFAULT_ORIGINS;

// ---------- app setup ----------
const app = express();
app.set('trust proxy', true);

// Simple request logger to debug incoming connections
app.use((req, res, next) => {
  console.log(`[relay] Received: ${req.method} ${req.url} (From: ${req.headers.origin || 'N/A'})`);
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// CORS (incl. preflight)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/postman
    if (ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    // Allow any localhost origin for dev flexibility
    try {
      const originUrl = new URL(origin);
      if (['localhost', '127.0.0.1'].includes(originUrl.hostname)) {
        console.log(`[relay] CORS: Dynamically allowing localhost origin: ${origin}`);
        return cb(null, true);
      }
    } catch (e) { /* malformed origin */ }
    
    console.warn(`[relay] CORS: Blocking origin: ${origin}`);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'], // Added Authorization
  credentials: false,
}));
app.options('*', cors());


// ---------- helpers ----------
function joinUrl(base, path) {
  const p = String(path || '');
  return p.startsWith('/') ? `${base}${p}` : `${base}/${p}`;
}

async function fetchWithRetry(url, opts, retries) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const res = await fetch(url, { ...opts, signal: controller.signal });

      clearTimeout(timer);
      return res;
    } catch (err) {
      lastErr = err;
      attempt += 1;
      if (attempt > retries) break;
      await new Promise(r => setTimeout(r, 400 * attempt)); // simple backoff
    }
  }
  throw lastErr;
}

async function forward(method, path, body, headers = {}) {
  const url = joinUrl(API_BASE, path);
  const forwardHeaders = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY, // relay injects your API key
    'User-Agent': headers['user-agent'] || 'OrganiTrafficBoost-Relay/1.0',
  };

  const opts = {
    method,
    headers: forwardHeaders,
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
  };

  try {
    const res = await fetchWithRetry(url, opts, RETRIES);
    const text = await res.text();

    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!res.ok) {
      console.error(`[relay] ${method} ${url} -> ${res.status}`, json);
    } else {
      console.log(`[relay] ${method} ${url} -> ${res.status}`);
    }
    return { status: res.status, json, headers: res.headers };
  } catch (err) {
    console.error(`[relay] ERROR ${method} ${url}:`, err.message);
    return { status: 502, json: { error: 'Bad Gateway (relay failed)', detail: err.message } };
  }
}

// ---------- routes ----------
// Root: quick manual check
app.get('/', (_req, res) => res.status(204).end());

// Local health
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    relay: true,
    upstream: API_BASE,
    timeout_ms: REQUEST_TIMEOUT_MS,
    retries: RETRIES,
    allow_origins: ALLOWED_ORIGINS,
    api_key_present: Boolean(API_KEY && API_KEY.length >= 16),
  });
});

// Relay endpoints used by your UI
app.post('/run', async (req, res) => {
  // The frontend calls /run, which we map to the correct upstream endpoint
  const { status, json } = await forward('POST', '/api/campaign/start', req.body, req.headers);
  res.status(status).json(json);
});

app.get('/status/:id', async (req, res) => {
  const id = encodeURIComponent(req.params.id);
  const { status, json } = await forward('GET', `/status/${id}`, null, req.headers);
  res.status(status).json(json);
});

app.get('/results/:id', async (req, res) => {
  const id = encodeURIComponent(req.params.id);
  const { status, json } = await forward('GET', `/results/${id}`, null, req.headers);
  res.status(status).json(json);
});

// Optional passthrough to upstream health
app.get('/upstream/health', async (req, res) => {
  const { status, json } = await forward('GET', '/health', null, req.headers);
  res.status(status).json(json);
});

// 404 helper
app.use('*', (_req, res) => res.status(404).json({ error: 'Not found', relay: true }));

// ---------- start / stop ----------
const server = app.listen(APP_PORT, () => {
  console.log(`Relay listening on http://localhost:${APP_PORT} -> ${API_BASE}`);
  if (!API_KEY || API_KEY.length < 16) {
    console.warn('[relay] WARNING: API_KEY is missing or too short; upstream may return 401.');
  }
});

function shutdown() {
  console.log('Shutting down relay...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);