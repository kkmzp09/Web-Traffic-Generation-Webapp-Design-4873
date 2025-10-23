import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiCopy, FiCheck, FiAlertCircle, FiCode, FiRefreshCw, FiCheckCircle } = FiIcons;

export default function WidgetInstallation() {
  const { user } = useAuth();
  const [siteId, setSiteId] = useState('');
  const [domain, setDomain] = useState('');
  const [widgetKey, setWidgetKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInstallations();
      generateSiteId();
    }
  }, [user]);

  const generateSiteId = () => {
    const id = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSiteId(id);
  };

  const loadInstallations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/widget/installations?userId=${user.id}`
      );
      const data = await response.json();

      if (data.success) {
        setInstallations(data.installations);
      }
    } catch (error) {
      console.error('Error loading installations:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const widgetCode = `<script src="https://api.organitrafficboost.com/widget.js" data-site-id="${siteId}"></script>`;

  const getStatusBadge = (installation) => {
    if (installation.is_online) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Online
        </span>
      );
    } else if (installation.last_ping) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          Offline
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          Not Connected
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Widget Installation</h1>
          <p className="text-gray-600">Install the Auto-Fix widget on your website to enable automatic SEO fixes</p>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 How Auto-Fix Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Install Widget</h3>
                <p className="text-sm text-indigo-100">Add one line of code to your website</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Scan & Generate Fixes</h3>
                <p className="text-sm text-indigo-100">AI analyzes your site and creates optimized content</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Auto-Apply</h3>
                <p className="text-sm text-indigo-100">Fixes are instantly applied to your live site</p>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <FiCode className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Installation Code</h2>
          </div>

          <div className="space-y-6">
            {/* Step 1: Generate Site ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 1: Enter your website domain
              </label>
              <input
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Step 2: Copy Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 2: Copy this code and paste it before the closing &lt;/body&gt; tag
              </label>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {widgetCode}
                </pre>
                <button
                  onClick={() => copyToClipboard(widgetCode)}
                  className="absolute top-2 right-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium transition-all"
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Platform-Specific Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Step 3: Platform-specific instructions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">WordPress</h4>
                  <p className="text-sm text-gray-600">
                    Go to <strong>Appearance → Theme Editor</strong> → Select <strong>footer.php</strong> → Paste code before &lt;/body&gt;
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Shopify</h4>
                  <p className="text-sm text-gray-600">
                    Go to <strong>Online Store → Themes → Edit Code</strong> → Open <strong>theme.liquid</strong> → Paste before &lt;/body&gt;
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Wix</h4>
                  <p className="text-sm text-gray-600">
                    Go to <strong>Settings → Custom Code</strong> → Add code to <strong>Body - end</strong>
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Custom HTML</h4>
                  <p className="text-sm text-gray-600">
                    Paste the code in your HTML file before the closing &lt;/body&gt; tag
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Installations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Installations</h2>
            <button
              onClick={loadInstallations}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <FiRefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading installations...</p>
            </div>
          ) : installations.length === 0 ? (
            <div className="text-center py-12">
              <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No installations yet</p>
              <p className="text-gray-400 text-sm mt-2">Install the widget on your website to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {installations.map((installation) => (
                <div
                  key={installation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{installation.domain}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Site ID: {installation.site_id}</span>
                        {installation.last_ping && (
                          <span>Last seen: {new Date(installation.last_ping).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(installation)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>The widget is lightweight (~5KB) and won't slow down your site</li>
                <li>Fixes are applied in real-time when you click "Apply Fix" in the dashboard</li>
                <li>The widget only modifies SEO elements (title, meta, headings, etc.)</li>
                <li>You can remove the widget anytime by deleting the code from your site</li>
                <li>Widget status updates every 30 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
