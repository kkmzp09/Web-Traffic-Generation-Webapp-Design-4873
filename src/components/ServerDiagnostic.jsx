import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { API_BASE, API_KEY } from '../config';

const { 
  FiServer, FiCheckCircle, FiXCircle, FiLoader, FiRefreshCw, 
  FiSettings, FiWifi, FiLock, FiGlobe, FiActivity, FiAlertTriangle
} = FiIcons;

export default function ServerDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    connectivity: { status: 'pending', message: '', details: null },
    cors: { status: 'pending', message: '', details: null },
    endpoints: { status: 'pending', message: '', details: null },
    authentication: { status: 'pending', message: '', details: null }
  });
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics({
      connectivity: { status: 'running', message: 'Testing VPS connection...', details: null },
      cors: { status: 'pending', message: '', details: null },
      endpoints: { status: 'pending', message: '', details: null },
      authentication: { status: 'pending', message: '', details: null }
    });

    // Test 1: Basic Connectivity
    await testConnectivity();
    
    // Test 2: CORS Configuration
    await testCORS();
    
    // Test 3: API Endpoints
    await testEndpoints();
    
    // Test 4: Authentication
    await testAuthentication();
    
    setIsRunning(false);
  };

  const testConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_BASE, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      setDiagnostics(prev => ({
        ...prev,
        connectivity: {
          status: 'success',
          message: `✅ VPS server reachable at ${API_BASE}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          }
        }
      }));
    } catch (error) {
      let message = '❌ Cannot connect to VPS server';
      let details = { error: error.message };

      if (error.name === 'AbortError') {
        message = '❌ Connection timeout - VPS server not responding';
        details.suggestion = 'Check if your VPS is running and port 3000 is open';
      } else if (error.message.includes('CORS')) {
        message = '❌ CORS error - VPS server blocking requests';
        details.suggestion = 'Configure CORS on your VPS server';
      } else if (error.message.includes('Network')) {
        message = '❌ Network error - cannot reach VPS server';
        details.suggestion = 'Check VPS IP address and firewall settings';
      }

      setDiagnostics(prev => ({
        ...prev,
        connectivity: { status: 'error', message, details }
      }));
    }
  };

  const testCORS = async () => {
    setDiagnostics(prev => ({
      ...prev,
      cors: { status: 'running', message: 'Testing CORS configuration...', details: null }
    }));

    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, x-api-key'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };

      if (corsHeaders['Access-Control-Allow-Origin']) {
        setDiagnostics(prev => ({
          ...prev,
          cors: {
            status: 'success',
            message: '✅ CORS properly configured on VPS',
            details: { corsHeaders }
          }
        }));
      } else {
        setDiagnostics(prev => ({
          ...prev,
          cors: {
            status: 'warning',
            message: '⚠️ CORS might not be configured on VPS',
            details: { 
              corsHeaders,
              suggestion: 'Add CORS middleware to your Express server on VPS'
            }
          }
        }));
      }
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        cors: {
          status: 'error',
          message: '❌ CORS test failed',
          details: { error: error.message }
        }
      }));
    }
  };

  const testEndpoints = async () => {
    setDiagnostics(prev => ({
      ...prev,
      endpoints: { status: 'running', message: 'Testing VPS API endpoints...', details: null }
    }));

    const endpoints = ['/health', '/run', '/status', '/results'];
    const results = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: endpoint === '/run' ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: endpoint === '/run' ? JSON.stringify({
            urls: ['https://example.com'],
            dwellMs: 5000,
            scroll: true
          }) : undefined
        });

        results[endpoint] = {
          status: response.status,
          statusText: response.statusText,
          available: response.status !== 404
        };
      } catch (error) {
        results[endpoint] = {
          status: 'error',
          error: error.message,
          available: false
        };
      }
    }

    const availableEndpoints = Object.values(results).filter(r => r.available).length;
    const totalEndpoints = endpoints.length;

    setDiagnostics(prev => ({
      ...prev,
      endpoints: {
        status: availableEndpoints > 0 ? 'success' : 'error',
        message: `${availableEndpoints}/${totalEndpoints} VPS endpoints available`,
        details: { results, endpoints }
      }
    }));
  };

  const testAuthentication = async () => {
    setDiagnostics(prev => ({
      ...prev,
      authentication: { status: 'running', message: 'Testing VPS API authentication...', details: null }
    }));

    try {
      // Test without API key
      const responseWithoutKey = await fetch(`${API_BASE}/health`, {
        method: 'GET'
      });

      // Test with API key
      const responseWithKey = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      const results = {
        withoutKey: {
          status: responseWithoutKey.status,
          statusText: responseWithoutKey.statusText
        },
        withKey: {
          status: responseWithKey.status,
          statusText: responseWithKey.statusText
        }
      };

      let status = 'success';
      let message = '✅ VPS authentication working properly';

      if (responseWithoutKey.status === 401 && responseWithKey.status === 200) {
        message = '✅ VPS API key authentication required and working';
      } else if (responseWithoutKey.status === 200 && responseWithKey.status === 200) {
        message = '⚠️ No authentication required on VPS';
        status = 'warning';
      } else if (responseWithKey.status === 401) {
        message = '❌ VPS API key authentication failed';
        status = 'error';
      }

      setDiagnostics(prev => ({
        ...prev,
        authentication: {
          status,
          message,
          details: { results, apiKey: API_KEY ? 'Configured' : 'Missing' }
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        authentication: {
          status: 'error',
          message: '❌ VPS authentication test failed',
          details: { error: error.message }
        }
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return FiCheckCircle;
      case 'error': return FiXCircle;
      case 'warning': return FiAlertTriangle;
      case 'running': return FiLoader;
      default: return FiActivity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              VPS Server Diagnostic
            </h2>
            <p className="text-gray-600">
              Testing connection to VPS server at {API_BASE}
            </p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <SafeIcon icon={FiRefreshCw} className={isRunning ? 'animate-spin' : ''} />
            <span>Run Tests</span>
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(diagnostics).map(([test, result]) => (
            <motion.div
              key={test}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SafeIcon 
                    icon={getStatusIcon(result.status)} 
                    className={`text-xl ${getStatusColor(result.status)} ${
                      result.status === 'running' ? 'animate-spin' : ''
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {test.replace(/([A-Z])/g, ' $1')} Test
                    </h3>
                    <p className="text-sm text-gray-600">
                      {result.message || 'Waiting...'}
                    </p>
                  </div>
                </div>
                {result.details && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </button>
                )}
              </div>

              {showDetails && result.details && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <pre className="text-xs text-gray-700 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Fixes */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
            <SafeIcon icon={FiSettings} className="mr-2" />
            Quick Fixes for VPS Server Issues
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>1. VPS Server Not Responding:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Check if your VPS is running: <code className="bg-blue-100 px-1 rounded">sudo systemctl status your-app</code></li>
                <li>• Verify port 3000 is open: <code className="bg-blue-100 px-1 rounded">sudo ufw allow 3000</code></li>
                <li>• Check if process is running: <code className="bg-blue-100 px-1 rounded">netstat -tlnp | grep :3000</code></li>
                <li>• Restart your application: <code className="bg-blue-100 px-1 rounded">pm2 restart your-app</code></li>
              </ul>
            </div>
            <div>
              <strong>2. CORS Issues on VPS:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Add CORS middleware to your Express server on VPS</li>
                <li>• Allow origin: <code className="bg-blue-100 px-1 rounded">Access-Control-Allow-Origin: *</code></li>
                <li>• Check nginx proxy configuration if using reverse proxy</li>
              </ul>
            </div>
            <div>
              <strong>3. Missing Endpoints on VPS:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Ensure your VPS server has routes for: /health, /run, /status, /results</li>
                <li>• Check VPS server logs for route registration</li>
                <li>• Verify your application is properly deployed on VPS</li>
              </ul>
            </div>
            <div>
              <strong>4. Firewall/Network Issues:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Check VPS firewall: <code className="bg-blue-100 px-1 rounded">sudo ufw status</code></li>
                <li>• Verify security group allows inbound traffic on port 3000</li>
                <li>• Test direct connection: <code className="bg-blue-100 px-1 rounded">curl http://67.217.60.57:3000/health</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Server Configuration */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">VPS Server Configuration:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">VPS Server URL:</span>
              <span className="ml-2 font-mono">{API_BASE}</span>
            </div>
            <div>
              <span className="text-gray-600">API Key:</span>
              <span className="ml-2 font-mono">{API_KEY ? '***configured***' : 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-600">Server Type:</span>
              <span className="ml-2">VPS Remote Only</span>
            </div>
            <div>
              <span className="text-gray-600">Port:</span>
              <span className="ml-2">3000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}