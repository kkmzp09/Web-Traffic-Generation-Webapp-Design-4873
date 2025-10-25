// src/components/GSCConnect.jsx
// Google Search Console Connection Component

import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

const GSCConnect = ({ userId }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.organitrafficboost.com';

  // Fetch existing connections
  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/gsc/connections?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setConnections(data.connections);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load connections');
      console.error('GSC fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google Search Console
  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await fetch(`${API_BASE}/api/gsc/auth-url?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        // Open OAuth URL in new window
        window.location.href = data.authUrl;
      } else {
        setError('Failed to generate auth URL');
      }
    } catch (err) {
      setError('Connection failed');
      console.error('GSC connect error:', err);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect a GSC connection
  const handleDisconnect = async (connectionId) => {
    if (!confirm('⚠️ Disconnect GSC?\n\nThis will remove access to keyword data for this site. You can reconnect anytime.')) {
      return;
    }

    try {
      setDisconnecting(connectionId);
      console.log('Disconnecting:', connectionId);
      
      const response = await fetch(
        `${API_BASE}/api/gsc/disconnect/${connectionId}?userId=${userId}`,
        { method: 'DELETE' }
      );
      
      console.log('Disconnect response:', response.status);
      const data = await response.json();
      console.log('Disconnect data:', data);

      if (data.success) {
        alert('✅ Disconnected successfully! Refreshing...');
        // Reload page to get fresh connections
        window.location.reload();
      } else {
        setError(data.error || 'Failed to disconnect');
        alert('❌ Failed to disconnect: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Disconnect failed: ' + err.message);
      alert('❌ Disconnect failed: ' + err.message);
      console.error('GSC disconnect error:', err);
    } finally {
      setDisconnecting(null);
    }
  };

  // Check for OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gsc_connected') === 'true') {
      fetchConnections();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (urlParams.get('gsc_error')) {
      setError('Connection failed. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConnections();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading connections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Google Search Console</h3>
          <p className="text-sm text-gray-600 mt-1">
            Connect to see real search performance data
          </p>
        </div>
        
        {connections.length === 0 && (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Connect GSC
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Connection Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {connections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Connected to {connections.length} site(s)</span>
          </div>

          <div className="space-y-2">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{conn.site_url}</p>
                    <p className="text-xs text-gray-500">
                      Connected {new Date(conn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                  <button
                    onClick={() => handleDisconnect(conn.id)}
                    disabled={disconnecting === conn.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={fetchConnections}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Connections
          </button>
        </div>
      )}

      {connections.length === 0 && !error && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Why connect?</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• See real search queries driving traffic</li>
            <li>• Get data-driven optimization suggestions</li>
            <li>• Track clicks, impressions, and rankings</li>
            <li>• Identify top-performing content</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GSCConnect;
