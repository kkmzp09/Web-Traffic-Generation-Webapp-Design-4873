// src/components/DatabaseInitializer.jsx
import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiDatabase, FiRefreshCw, FiCheck, FiX, FiAlertTriangle, FiTool, FiSettings,
} = FiIcons;

const AUTH_API_BASE = import.meta.env?.VITE_AUTH_API_BASE || '';

export default function DatabaseInitializer() {
  const [status, setStatus] = useState('idle'); // idle | checking | initializing | success | error
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [initStatus, setInitStatus] = useState(null);
  const [authApiHealthy, setAuthApiHealthy] = useState(null); // null | true | false

  useEffect(() => {
    // First, probe the Auth/DB API health (so we show a clear hint if not configured)
    (async () => {
      if (!AUTH_API_BASE) {
        setAuthApiHealthy(false);
        return;
      }
      try {
        const r = await fetch(`${AUTH_API_BASE}/health`);
        setAuthApiHealthy(r.ok);
      } catch {
        setAuthApiHealthy(false);
      }
    })().then(checkInitialization);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkInitialization = async () => {
    setStatus('checking');
    setError(null);
    try {
      const { checkDatabaseInitialization } = await import('../lib/initializeDatabase');
      const result = await checkDatabaseInitialization();
      setInitStatus(result);
      setStatus(result.isInitialized ? 'success' : 'idle');
    } catch (err) {
      console.error('Error checking database:', err);
      setError(err.message || 'Failed to check database.');
      setStatus('error');
    }
  };

  const initializeDatabase = async () => {
    await runOp(async () => {
      const { createDatabaseTables } = await import('../lib/initializeDatabase');
      return createDatabaseTables();
    });
  };

  const reinitializeAll = async () => {
    if (!window.confirm('This will delete ALL existing data. Continue?')) return;
    await runOp(async () => {
      const { reinitializeDatabase } = await import('../lib/initializeDatabase');
      return reinitializeDatabase();
    });
  };

  const fixSchema = async () => {
    await runOp(async () => {
      const { fixDatabaseSchema } = await import('../lib/initializeDatabase');
      return fixDatabaseSchema();
    });
  };

  const rebuildUsers = async () => {
    if (!window.confirm('This will rebuild users table (data preserved); sessions may be cleared. Continue?')) return;
    await runOp(async () => {
      const { rebuildUsersTableSchema } = await import('../lib/initializeDatabase');
      return rebuildUsersTableSchema();
    });
  };

  const runOp = async (fn) => {
    setStatus('initializing');
    setError(null);
    setResults([]);
    try {
      const result = await fn();
      setResults(result?.results || []);
      if (result?.success) {
        setStatus('success');
        await checkInitialization();
      } else {
        setError(result?.error || result?.message || 'Operation failed.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Operation error:', err);
      setError(err.message || 'Operation failed.');
      setStatus('error');
    }
  };

  const getStatusColor = (stepStatus) => {
    switch (stepStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'success': return FiCheck;
      case 'error': return FiX;
      case 'running': return FiRefreshCw;
      default: return FiDatabase;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiDatabase} className="text-xl text-gray-700" />
          <h3 className="text-lg font-medium text-gray-900">Database Schema Manager</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={checkInitialization}
            disabled={status === 'checking' || status === 'initializing'}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-1"
          >
            <SafeIcon icon={FiRefreshCw} className={status === 'checking' ? 'animate-spin' : ''} />
            <span>Check Status</span>
          </button>
        </div>
      </div>

      {/* Auth API base warning */}
      {authApiHealthy === false && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <div className="font-medium mb-1">Auth/DB API not reachable</div>
          <div>Set <code className="px-1 py-0.5 bg-yellow-100 rounded">VITE_AUTH_API_BASE</code> in your frontend <code>.env</code> and ensure your Linux Auth/DB API is running and reachable.</div>
        </div>
      )}

      {/* Status Display */}
      {initStatus && (
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Database Status:</span>
            <span className={`flex items-center space-x-1 font-medium ${
              initStatus.isInitialized ? 'text-green-600' : 'text-yellow-600'
            }`}>
              <SafeIcon icon={initStatus.isInitialized ? FiCheck : FiAlertTriangle} />
              <span>{initStatus.isInitialized ? 'Schema Complete' : 'Schema Issues Found'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Tables Found:</span>
                <span className={initStatus.tablesFound === (initStatus.tablesExpected ?? 7) ? 'text-green-600' : 'text-yellow-600'}>
                  {initStatus.tablesFound}/{initStatus.tablesExpected ?? 7}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Users Table:</span>
                <span className={initStatus.hasRequiredUsersColumns ? 'text-green-600' : 'text-red-600'}>
                  {initStatus.hasRequiredUsersColumns ? 'Complete' : 'Missing Columns'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions Table:</span>
                <span className={initStatus.hasRequiredSessionColumns ? 'text-green-600' : 'text-red-600'}>
                  {initStatus.hasRequiredSessionColumns ? 'Complete' : 'Missing Columns'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              {initStatus.missingUsersColumns?.length > 0 && (
                <div>
                  <span className="text-red-600 font-medium">Missing Users Columns:</span>
                  <div className="text-red-500 text-xs mt-1">
                    {initStatus.missingUsersColumns.join(', ')}
                  </div>
                </div>
              )}
              {initStatus.missingSessionColumns?.length > 0 && (
                <div>
                  <span className="text-red-600 font-medium">Missing Session Columns:</span>
                  <div className="text-red-500 text-xs mt-1">
                    {initStatus.missingSessionColumns.join(', ')}
                  </div>
                </div>
              )}
              {initStatus.error && (
                <div>
                  <span className="text-red-600 font-medium">Error:</span>
                  <div className="text-red-500 text-xs mt-1">{initStatus.error}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <button
          onClick={initializeDatabase}
          disabled={status === 'checking' || status === 'initializing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={status === 'initializing' ? FiRefreshCw : FiDatabase}
                    className={status === 'initializing' ? 'animate-spin' : ''} />
          <span className="text-sm">Initialize DB</span>
        </button>

        <button
          onClick={fixSchema}
          disabled={status === 'checking' || status === 'initializing'}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiTool} />
          <span className="text-sm">Fix Schema</span>
        </button>

        <button
          onClick={rebuildUsers}
          disabled={status === 'checking' || status === 'initializing'}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiSettings} />
          <span className="text-sm">Rebuild Users</span>
        </button>

        <button
          onClick={reinitializeAll}
          disabled={status === 'checking' || status === 'initializing'}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiRefreshCw} />
          <span className="text-sm">Reset All</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <SafeIcon icon={FiX} />
            <span className="font-medium">Error:</span>
          </div>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {results?.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <SafeIcon icon={FiSettings} />
            <span>Operation Progress:</span>
          </h4>
          <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {results.map((result, index) => {
                const Icon = getStatusIcon(result.status);
                return (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <SafeIcon
                      icon={Icon}
                      className={`mt-0.5 flex-shrink-0 ${getStatusColor(result.status)} ${
                        result.status === 'running' ? 'animate-spin' : ''
                      }`}
                    />
                    <div className="flex-1">
                      <span className="text-gray-900">{result.step}</span>
                      {result.error && (
                        <div className="text-red-600 text-xs mt-1">Error: {result.error}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <SafeIcon icon={FiCheck} />
            <span className="font-medium">Database Schema Ready!</span>
          </div>
          <p className="mt-2 text-sm text-green-700">
            All database tables and columns are properly configured. Your authentication system is ready to use.
          </p>
          <div className="mt-3 text-xs text-green-600">
            ✅ Users table with all profile fields<br/>
            ✅ Session tracking with IP and user agent<br/>
            ✅ Campaign and analytics tables<br/>
            ✅ Proper indexes for performance
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">Quick Fix Options:</div>
          <ul className="text-xs space-y-1 text-blue-700">
            <li><strong>Fix Schema:</strong> Adds missing columns (safe, preserves data)</li>
            <li><strong>Rebuild Users:</strong> Recreates users table with all columns (preserves user data)</li>
            <li><strong>Initialize DB:</strong> Creates missing tables (safe if tables don’t exist)</li>
            <li><strong>Reset All:</strong> Deletes everything and starts fresh (destructive)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}