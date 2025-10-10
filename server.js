// server.js (DEV RELAY) — forwards to your real Playwright API on the VPS
// Usage:
//   npm i node-fetch@3
//   node server.js
// Frontend can call: http://localhost:3001/run, /status/:id, /results/:id

const express = require('express');
const cors = require('cors');

// node-fetch v3 is ESM; use dynamic import in CJS:
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const APP_PORT = process.env.PORT || 3001;

// Set these via env in CI/hosting if you want, but defaults work for you:
const API_BASE = process.env.REAL_API_BASE || 'https://api.organitrafficboost.com';
const API_KEY  = process.env.REAL_API_KEY  || 'm7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp';

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://organitrafficboost.com',
    'https://www.organitrafficboost.com'
  ],
  credentials: false
}));

// local health for quick checks
app.get('/health', (req, res) => res.json({ ok: true, relay: true, upstream: API_BASE }));

async function forward(method, path, body) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return { status: res.status, json: JSON.parse(text) }; }
  catch { return { status: res.status, json: { raw: text } }; }
}

// Relay the three API endpoints your UI uses
app.post('/run', async (req, res) => {
  const { status, json } = await forward('POST', '/run', req.body);
  res.status(status).json(json);
});

app.get('/status/:id', async (req, res) => {
  const { status, json } = await forward('GET', `/status/${encodeURIComponent(req.params.id)}`);
  res.status(status).json(json);
});

app.get('/results/:id', async (req, res) => {
  const { status, json } = await forward('GET', `/results/${encodeURIComponent(req.params.id)}`);
  res.status(status).json(json);
});

// Optional passthrough to upstream health
app.get('/upstream/health', async (req, res) => {
  const { status, json } = await forward('GET', '/health');
  res.status(status).json(json);
});

// 404 helper
app.use('*', (_req, res) => res.status(404).json({ error: 'Not found', relay: true }));

app.listen(APP_PORT, () => {
  console.log(`Relay listening on http://localhost:${APP_PORT} -> ${API_BASE}`);
});