// src/components/DatabaseStatus.jsx
import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import { getDatabaseStatus, getDatabaseInfo, healthCheck } from '../lib/database';
import * as FiIcons from 'react-icons/fi';

const {
  FiDatabase,
  FiCheck,
  FiAlertCircle,
  FiWifi,
  FiShield,
  FiRefreshCw,
  FiActivity,
  FiServer,
} = FiIcons;

const AUTH_API_BASE = import.meta.env?.VITE_AUTH_API_BASE || '';

export default function DatabaseStatus() {
  const [dbStatus, setDbStatus] = useState(null);
  const [dbInfo, setDbInfo] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(null); // null | true | false

  useEffect(() => {
    (async () => {
      // Probe the Auth/DB API first so we can display a helpful hint
      if (!AUTH_API_BASE) {
        setApiHealthy(false);
      } else {
        try {
          const r = await fetch(`${AUTH_API_BASE}/health`, { method: 'GET' });
          setApiHealthy(r.ok);
        } catch {
          setApiHealthy(false);
        }
      }
      await checkStatus();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const [status, info, health] = await Promise.all([
        getDatabaseStatus(), // { status: 'connected' | 'error', error? }
        getDatabaseInfo(),   // may be null in the frontend stub
        healthCheck(),       // { healthy: boolean, ...optional info }
      ]);
      setDbStatus(status);
      setDbInfo(info);
      setHealthData(health);
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus({ status: 'error', error: error.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const health = await healthCheck();
      setHealthData(health);
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <SafeIcon icon={FiRefreshCw} className="animate-spin text-blue-600 text-2xl" />
          <span className="ml-2 text-gray-600">Checking API/DB status…</span>
        </div>
      </div>
    );
  }

  if (!dbStatus) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected': return { cls: 'bg-green-100 text-green-700', Icon: FiCheck, label: 'connected' };
      case 'error':     return { cls: 'bg-red-100 text-red-700',   Icon: FiAlertCircle, label: 'error' };
      default:          return { cls: 'bg-gray-100 text-gray-700', Icon: FiDatabase, label: status || 'unknown' };
    }
  };

  const badge = getStatusBadge(dbStatus.status);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      {/* API banner if unhealthy */}
      {apiHealthy === false && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <div className="flex items-center">
            <SafeIcon icon={FiServer} className="mr-2" />
            <div>
              <div className="font-medium">Auth/DB API not reachable</div>
              <div>
                Set <code className="px-1 py-0.5 bg-yellow-100 rounded">VITE_AUTH_API_BASE</code> in your frontend
                <code className="px-1 py-0.5 bg-yellow-100 rounded ml-1">.env</code> and ensure your Linux Auth/DB API is up.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <SafeIcon icon={FiDatabase} className="text-blue-600" />
          <span>Auth/DB Service Status</span>
        </h3>

        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${badge.cls}`}>
            <SafeIcon icon={badge.Icon} className="text-sm" />
            <span className="capitalize">{badge.label}</span>
          </div>

          <button
            onClick={testConnection}
            disabled={testing}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <SafeIcon icon={FiActivity} className={`text-sm ${testing ? 'animate-pulse' : ''}`} />
            <span>{testing ? 'Testing…' : 'Test'}</span>
          </button>
        </div>
      </div>

      {/* Basic info (safe defaults since frontend no longer knows DB details) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <Row label="Service">
            <span className="font-medium text-gray-900">Linux Auth/DB API</span>
          </Row>
          <Row label="Base URL">
            <span className="font-medium text-gray-900 break-all">
              {AUTH_API_BASE || 'Not configured'}
            </span>
          </Row>
          <Row label="Transport">
            <span className="font-medium text-gray-900">HTTPS (via fetch)</span>
          </Row>
          <Row label="Security">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiShield} className="text-green-600 text-sm" />
              <span className="font-medium text-green-600">Handled server-side</span>
            </div>
          </Row>
        </div>

        <div className="space-y-3">
          <Row label="Provider">
            <span className="font-medium text-gray-900">{dbStatus.provider || 'Server-side (hidden from client)'}</span>
          </Row>
          <Row label="ORM">
            <span className="font-medium text-gray-900">{dbInfo?.orm || 'Server-side (Drizzle)'} </span>
          </Row>
          <Row label="Driver">
            <span className="font-medium text-gray-900">{dbInfo?.driver || 'Server-side (pg)'} </span>
          </Row>
          <Row label="Connectivity">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiWifi} className={dbStatus.status === 'connected' ? 'text-blue-600' : 'text-gray-400'} />
              <span className={`font-medium ${dbStatus.status === 'connected' ? 'text-blue-600' : 'text-gray-600'}`}>
                {dbStatus.status === 'connected' ? 'OK' : 'Unknown'}
              </span>
            </div>
          </Row>
        </div>
      </div>

      {/* Health Check Results */}
      {healthData && (
        <div className={`border rounded-lg p-4 ${healthData.healthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start space-x-3">
            <SafeIcon
              icon={healthData.healthy ? FiCheck : FiAlertCircle}
              className={`mt-0.5 ${healthData.healthy ? 'text-green-600' : 'text-red-600'}`}
            />
            <div className="flex-1">
              <h4 className={`font-medium ${healthData.healthy ? 'text-green-900' : 'text-red-900'}`}>
                {healthData.healthy ? 'Service Healthy' : 'Service Issues'}
              </h4>
              {healthData.healthy && healthData.info && (
                <div className="text-sm text-green-700 mt-2 space-y-1">
                  <p><strong>Checked:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
                </div>
              )}
              {!healthData.healthy && (
                <p className="text-sm text-red-700 mt-1">{healthData.error || 'Unreachable'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {dbStatus.status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiAlertCircle} className="text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Service Error</h4>
              <p className="text-sm text-red-700 mt-1">{dbStatus.error}</p>
              <div className="mt-3 text-sm text-red-700">
                <p><strong>Troubleshooting:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Confirm <code>VITE_AUTH_API_BASE</code> is set in your frontend <code>.env</code></li>
                  <li>Ensure the Linux Auth/DB API is running and its <code>/health</code> route returns 200</li>
                  <li>If using a domain, verify Nginx proxy and DNS are correct</li>
                  <li>Check server logs for the Auth/DB API</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}