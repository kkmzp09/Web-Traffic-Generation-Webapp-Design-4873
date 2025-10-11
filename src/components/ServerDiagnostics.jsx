import React, { useMemo, useState } from 'react';
import * as Fi from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { DEFAULT_SERVER_CONFIG, getServerUrl } from '../config';
import {
  checkServerHealth,
  checkCampaignStatus,
  getCampaignResults,
  startCampaign,
  handleApiError,
} from '../api';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function ServerDiagnostics({
  defaultUrl = 'https://example.com/?utm_source=otb&utm_medium=direct&utm_campaign=diagnostic',
}) {
  const { isAdmin } = useAuth();        // admin-only gate
  const [serverConfig] = useState(DEFAULT_SERVER_CONFIG);

  const [targetUrl, setTargetUrl] = useState(defaultUrl);
  const [visits, setVisits] = useState(1);
  const [dwellMs, setDwellMs] = useState(15000);
  const [running, setRunning] = useState(false);

  const [health, setHealth] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [log, setLog] = useState([]);

  const baseUrl = useMemo(() => getServerUrl(serverConfig), [serverConfig]);

  const pushLog = (line) => setLog((prev) => [`${new Date().toISOString()}: ${line}`, ...prev].slice(0, 200));

  // 1) /health
  const testConnectivity = async () => {
    try {
      const h = await checkServerHealth(serverConfig);
      setHealth(h);
      pushLog(`Health OK: ${JSON.stringify(h)}`);
    } catch (e) {
      setHealth({ ok: false, error: e?.message || String(e) });
      pushLog(`Health FAIL: ${e?.message || String(e)}`);
    }
  };

  // 2) /status/test (auth required)
  const testAuth = async () => {
    try {
      const res = await fetch(`${baseUrl}/status/test`, { headers: { 'x-api-key': serverConfig.apiKey } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setAuthStatus({ ok: true, ...json });
      pushLog(`Auth OK: ${JSON.stringify(json)}`);
    } catch (e) {
      setAuthStatus({ ok: false, error: e?.message || String(e) });
      pushLog(`Auth FAIL: ${e?.message || String(e)}`);
    }
  };

  // Build a tiny real run (server launches Playwright, opens a browser)
  const buildPayload = () => {
    const count = clamp(Number(visits) || 1, 1, 5); // keep smoke small
    const urls = Array.from({ length: count }, () => targetUrl.trim());
    return {
      urls,
      dwellMs: clamp(Number(dwellMs) || 15000, 10000, 120000),
      scroll: true,
      // light GA-friendly bits to ensure page actually renders and JS runs:
      actions: [
        { type: 'waitForSelector', selector: 'body' },
        // consent best-effort
        { type: 'waitForSelector', selector: '#onetrust-accept-btn-handler' },
        { type: 'click',           selector: '#onetrust-accept-btn-handler' },
      ],
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    };
  };

  // Poll until job finishes or timeout
  const pollUntilDone = async (id, timeoutMs = 180000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const s = await checkCampaignStatus(id, serverConfig);
      setProgress(s?.progress || 0);
      pushLog(`Status: ${s?.status} ${s?.done || 0}/${s?.total || 0} (${s?.progress || 0}%)`);
      if (s?.status === 'finished' || s?.status === 'completed') return true;
      if (s?.status === 'failed' || s?.status === 'error') return false;
      await new Promise((r) => setTimeout(r, 1500));
    }
    throw new Error('Timeout while waiting for job to finish');
  };

  // 3) Fire smoke test end-to-end
  const runSmoke = async () => {
    if (!isAdmin) {
      pushLog('Blocked: admin only.');
      return;
    }
    setRunning(true);
    setResults(null);
    setProgress(0);
    setJobId(null);

    try {
      const payload = buildPayload();
      pushLog(`POST /run ${JSON.stringify({ ...payload, urls: [`${payload.urls[0]} ... x${payload.urls.length}`] })}`);
      const { id } = await startCampaign(payload, serverConfig);
      setJobId(id);
      pushLog(`Job started: ${id}`);

      const finished = await pollUntilDone(id);
      pushLog(`Job finished = ${finished}`);

      const r = await getCampaignResults(id, serverConfig);
      setResults(r);
      // “Real browser” evidence: ok=true + status code + page title + screenshot path present
      const okCount = Array.isArray(r?.results) ? r.results.filter(x => x.ok).length : 0;
      pushLog(`Results: ${okCount}/${r?.results?.length || 0} ok`);
    } catch (e) {
      pushLog(`Smoke FAIL: ${handleApiError(e)}`);
    } finally {
      setRunning(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 rounded-lg border bg-yellow-50 text-yellow-800">
        <div className="flex items-center space-x-2">
          <Fi.FiAlertTriangle />
          <span>Diagnostics are admin-only.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Server Diagnostics</h2>
          <span className="text-xs text-gray-500">API: <strong>{baseUrl}</strong></span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={testConnectivity}
            className="flex items-center justify-center rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            <Fi.FiActivity className="mr-2" /> Check Connectivity (/health)
          </button>

          <button
            onClick={testAuth}
            className="flex items-center justify-center rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            <Fi.FiKey className="mr-2" /> Verify Auth (/status/test)
          </button>

          <button
            onClick={runSmoke}
            disabled={running}
            className={`flex items-center justify-center rounded-lg border px-4 py-2 ${
              running ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            <Fi.FiPlay className="mr-2" /> Run Smoke Test (1–5 visits)
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
            <input
              type="url"
              className="w-full rounded-md border px-3 py-2"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://your-site.com/?utm_source=otb..."
              disabled={running}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visits</label>
            <input
              type="number"
              min={1}
              max={5}
              className="w-full rounded-md border px-3 py-2"
              value={visits}
              onChange={(e) => setVisits(e.target.value)}
              disabled={running}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dwell per visit (ms)</label>
            <input
              type="number"
              min={10000}
              max={120000}
              className="w-full rounded-md border px-3 py-2"
              value={dwellMs}
              onChange={(e) => setDwellMs(e.target.value)}
              disabled={running}
            />
          </div>
        </div>

        {/* Status tiles */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InfoTile title="Connectivity" value={health ? (health.ok ? 'OK' : 'FAIL') : '—'} />
          <InfoTile title="Auth" value={authStatus ? (authStatus.ok ? 'OK' : 'FAIL') : '—'} />
          <InfoTile title="Job ID" value={jobId || '—'} mono />
        </div>

        {/* Progress bar */}
        {jobId && (
          <div className="mt-3">
            <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
              <div
                className="h-2 bg-blue-600 transition-all"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-600">Progress: {progress || 0}%</div>
          </div>
        )}

        {/* Results */}
        {results?.results && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Results</h3>
            <ul className="space-y-2">
              {results.results.map((r, i) => (
                <li key={i} className="rounded border px-3 py-2">
                  <div className="text-sm">
                    <strong>{r.ok ? 'OK' : 'FAIL'}</strong>
                    {' · '}
                    {r.status ? `HTTP ${r.status}` : 'no-status'}
                    {' · '}
                    {r.title || '(no title)'}
                  </div>
                  <div className="text-xs text-gray-600 break-all">
                    URL: {r.url}
                  </div>
                  <div className="text-xs text-gray-600">
                    Evidence: {r.screenshot ? `screenshot saved (${r.screenshot})` : 'no screenshot'}
                  </div>
                  {r.error && (
                    <div className="text-xs text-red-600">Error: {r.error}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Log */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Diagnostic Log</h3>
          <div className="rounded border bg-gray-50 p-3 max-h-56 overflow-auto text-xs font-mono whitespace-pre-wrap">
            {log.length ? log.join('\n') : 'No logs yet.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ title, value, mono }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`mt-1 text-sm ${mono ? 'font-mono break-all' : 'font-medium'}`}>{String(value)}</div>
    </div>
  );
}