import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';
import ScanProgressModal from './ScanProgressModal';
import UpgradeModal from './UpgradeModal';
import WebsiteManager from './WebsiteManager';

const { FiSearch, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiClock, FiZap, FiRefreshCw } = FiIcons;

export default function SEODashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanUrl, setScanUrl] = useState('');
  const [fixingIssues, setFixingIssues] = useState({});
  
  // Progress tracking
  const [showProgress, setShowProgress] = useState(false);
  const [currentScanId, setCurrentScanId] = useState(null);
  
  // Subscription usage
  const [subscriptionUsage, setSubscriptionUsage] = useState(null);
  
  // Limit enforcement
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitData, setLimitData] = useState(null);
  
  // Widget validation
  const [widgetStatus, setWidgetStatus] = useState(null); // null, 'checking', 'live', 'not-found'
  const [validatingWidget, setValidatingWidget] = useState(false);
  
  // Current scan results (to display inline)
  const [currentScanResults, setCurrentScanResults] = useState(null);
  const [currentScanIssues, setCurrentScanIssues] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadSubscriptionUsage();
    }
  }, [user]);

  const loadSubscriptionUsage = async () => {
    try {
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/subscription-usage/${user.id}`
      );
      const data = await response.json();
      if (data.success) {
        setSubscriptionUsage(data);
      }
    } catch (error) {
      console.error('Error loading subscription usage:', error);
    }
  };

  const validateWidget = async () => {
    if (!scanUrl) {
      alert('Please enter a URL first');
      return;
    }

    setValidatingWidget(true);
    setWidgetStatus('checking');

    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/validate-widget',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: scanUrl })
        }
      );

      const data = await response.json();
      
      if (data.success && data.widgetInstalled) {
        setWidgetStatus('live');
      } else {
        setWidgetStatus('not-found');
      }
    } catch (error) {
      console.error('Widget validation error:', error);
      setWidgetStatus('not-found');
    } finally {
      setValidatingWidget(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/dashboard-stats?userId=${user.id}`
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentScans(data.recentScans);
        setTopIssues(data.topIssues);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScan = async () => {
    if (!scanUrl.trim()) {
      alert('Please enter a URL to scan');
      return;
    }

    try {
      setScanning(true);
      console.log('Starting scan for:', scanUrl);
      console.log('User ID:', user.id);
      
      const response = await fetch('https://api.organitrafficboost.com/api/seo/scan-page', {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          url: scanUrl,
          userId: user.id
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Scan response:', data);

      if (data.success) {
        setScanUrl('');
        setCurrentScanId(data.scanId);
        setShowProgress(true);
        // Reload subscription usage after scan starts
        loadSubscriptionUsage();
      } else if (data.limitReached) {
        // Show upgrade modal
        setLimitData(data);
        setShowUpgradeModal(true);
      } else {
        alert('❌ Scan failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Scan error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      let errorMsg = 'Failed to start scan';
      if (error.message.includes('Failed to fetch')) {
        errorMsg = 'Network error - Please check your internet connection or try again';
      } else if (error.message.includes('CORS')) {
        errorMsg = 'CORS error - Please wait for deployment to complete';
      } else {
        errorMsg = error.message;
      }
      
      alert('❌ ' + errorMsg);
    } finally {
      setScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const autoFixIssue = async (issue) => {
    const key = issue.category;
    setFixingIssues(prev => ({ ...prev, [key]: true }));

    try {
      // Call optimization recommendation API
      const response = await fetch('https://api.organitrafficboost.com/api/seo/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          category: issue.category,
          severity: issue.severity
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Successfully fixed ${issue.count} ${issue.category} issues!`);
        // Reload dashboard data
        loadDashboardData();
      } else {
        alert(`❌ Failed to fix issues: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Optimization error:', error);
      alert('❌ Failed to generate recommendations. Please try again.');
    } finally {
      setFixingIssues(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Optimization Dashboard</h1>
          <p className="text-gray-600">Scan, analyze, and get AI-powered recommendations for your pages</p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
          <div className="flex items-start">
            <FiAlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How SEO Optimization Works</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">1. Analysis:</span>
                  <span>DataForSEO scans 200+ ranking factors and identifies issues</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">2. Recommendations:</span>
                  <span>AI generates optimized content suggestions</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">3. Preview:</span>
                  <span>JavaScript widget shows how changes would look (preview only)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">4. Production:</span>
                  <span className="font-semibold text-blue-900">Server-side deployment with approval required (contact support)</span>
                </li>
              </ul>
              <p className="text-xs text-blue-700 mt-3 italic">
                Rankings are not guaranteed and depend on competition, content quality, and Google's algorithm.
              </p>
            </div>
          </div>
        </div>

        {/* Website Manager - Replaces search bar */}
        <WebsiteManager />

        {/* Subscription Limit Reached - Upgrade Notification */}
        {subscriptionUsage && subscriptionUsage.percentUsed >= 100 && (
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Subscription Limit Reached!</h3>
                </div>
                <p className="text-red-100 mb-4">
                  You've used all {subscriptionUsage.pageLimit} pages in your {subscriptionUsage.currentPlan} plan. 
                  Upgrade now to continue scanning or purchase additional credits.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setLimitData({
                        currentPlan: subscriptionUsage.currentPlan,
                        pagesScanned: subscriptionUsage.pagesScanned,
                        pageLimit: subscriptionUsage.pageLimit,
                        upgradeOptions: [
                          { plan: 'Professional', limit: 500, price: 6557, features: 'Priority support, API access, Scheduled scans' },
                          { plan: 'Business', limit: 2500, price: 16517, features: 'Dedicated support, White-label, Team collaboration' }
                        ],
                        addOnOptions: [
                          { name: 'Extra 100 pages', pages: 100, price: 830 },
                          { name: 'Extra 250 pages', pages: 250, price: 1660 },
                          { name: 'Extra 500 pages', pages: 500, price: 2905 }
                        ]
                      });
                      setShowUpgradeModal(true);
                    }}
                    className="px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-all shadow-md flex items-center gap-2"
                  >
                    <FiZap className="w-5 h-5" />
                    Upgrade Subscription
                  </button>
                  <button
                    onClick={() => {
                      const code = prompt('Enter your discount code:');
                      if (code) {
                        // Navigate directly to checkout with discount code
                        navigate('/checkout', {
                          state: {
                            plan: {
                              name: 'Professional',
                              type: 'seo_professional',
                              price: 6557,
                              pages: 500,
                              features: ['Priority support', 'API access', 'Scheduled scans', 'Advanced analytics']
                            },
                            discountCode: code
                          }
                        });
                      }
                    }}
                    className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 font-semibold transition-all shadow-md flex items-center gap-2"
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    Apply Discount Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Usage - Show when not at limit */}
        {subscriptionUsage && subscriptionUsage.percentUsed < 100 && (
          <div className={`rounded-2xl shadow-lg p-6 mb-6 text-white ${
            subscriptionUsage.percentUsed >= 80 
              ? 'bg-gradient-to-r from-orange-600 to-red-600' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Subscription Usage</h3>
                <p className={`text-sm ${subscriptionUsage.percentUsed >= 80 ? 'text-orange-100' : 'text-indigo-100'}`}>
                  Pages scanned this month
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{subscriptionUsage.pagesScanned} / {subscriptionUsage.pageLimit}</div>
                <p className={`text-sm ${subscriptionUsage.percentUsed >= 80 ? 'text-orange-100' : 'text-indigo-100'}`}>
                  {subscriptionUsage.pagesRemaining} pages remaining
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`w-full rounded-full h-3 ${
                subscriptionUsage.percentUsed >= 80 ? 'bg-orange-800' : 'bg-indigo-800'
              }`}>
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${subscriptionUsage.percentUsed}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${subscriptionUsage.percentUsed >= 80 ? 'text-orange-100' : 'text-indigo-100'}`}>
                {subscriptionUsage.percentUsed}% used
              </p>
            </div>
            {subscriptionUsage.percentUsed >= 80 && (
              <div className="mt-4 pt-4 border-t border-orange-400">
                <p className="text-orange-100 text-sm mb-3">
                  ⚠️ Running low on pages! Upgrade now to avoid interruption.
                </p>
                <button
                  onClick={() => {
                    setLimitData({
                      currentPlan: subscriptionUsage.currentPlan,
                      pagesScanned: subscriptionUsage.pagesScanned,
                      pageLimit: subscriptionUsage.pageLimit,
                      upgradeOptions: [
                        { plan: 'Professional', limit: 500, price: 6557, features: 'Priority support, API access, Scheduled scans' },
                        { plan: 'Business', limit: 2500, price: 16517, features: 'Dedicated support, White-label, Team collaboration' }
                      ],
                      addOnOptions: [
                        { name: 'Extra 100 pages', pages: 100, price: 830 },
                        { name: 'Extra 250 pages', pages: 250, price: 1660 },
                        { name: 'Extra 500 pages', pages: 500, price: 2905 }
                      ]
                    });
                    setShowUpgradeModal(true);
                  }}
                  className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 font-semibold transition-all text-sm"
                >
                  View Upgrade Options
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Scan - Full Width */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Scan</h2>
          <div className="flex items-center gap-4">
            <FiSearch className="w-6 h-6 text-indigo-600" />
            <input
              type="url"
              placeholder="Enter URL to scan (e.g., https://example.com)"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={scanning}
            />
            <button
              onClick={startScan}
              disabled={scanning}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all"
            >
              {scanning ? (
                <>
                  <FiRefreshCw className="w-5 h-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FiZap className="w-5 h-5" />
                  Scan Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {/* Credit Savings & Skipped Pages Info */}
        {stats?.pages_skipped > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiZap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  💰 Smart Scan Optimization
                </h3>
                <p className="text-blue-700 mb-3">
                  We skipped <span className="font-bold">{stats.pages_skipped} page(s)</span> with pending issues to save your page credits!
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Pages Scanned</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.pages_scanned || 1}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Credits Saved</div>
                    <div className="text-2xl font-bold text-green-600">{stats.pages_skipped}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-600">
                  ℹ️ Pages with unfixed issues are automatically skipped to maximize your subscription value
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Scans - Moved below Smart Scan */}
        {recentScans.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Scans</h2>
              <button
                onClick={loadDashboardData}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentScans.slice(0, 6).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/seo-scan/${scan.id}`)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">{scan.url}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(scan.scanned_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(scan.seo_score)} ${getScoreColor(scan.seo_score)}`}>
                      {scan.seo_score}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Click to view details →
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inline Scan Results */}
        {currentScanResults && (
          <div id="scan-results" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scan Results</h2>
                <p className="text-sm text-gray-600 mt-1">{currentScanResults.url}</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${
                  currentScanResults.seo_score >= 80 ? 'text-green-600' :
                  currentScanResults.seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentScanResults.seo_score}
                </div>
                <div className="text-sm text-gray-600">SEO Score</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-red-600 mb-1">Critical Issues</div>
                <div className="text-2xl font-bold text-red-700">{currentScanResults.critical_issues || 0}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-sm text-yellow-600 mb-1">Warnings</div>
                <div className="text-2xl font-bold text-yellow-700">{currentScanResults.warnings || 0}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 mb-1">Passed</div>
                <div className="text-2xl font-bold text-green-700">{currentScanResults.passed_checks || 0}</div>
              </div>
            </div>

            {/* Issues List */}
            {currentScanIssues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Found</h3>
                <div className="space-y-3">
                  {currentScanIssues.slice(0, 10).map((issue, idx) => (
                    <div key={idx} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          issue.severity === 'critical' ? 'bg-red-100' :
                          issue.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <FiAlertCircle className={`w-5 h-5 ${
                            issue.severity === 'critical' ? 'text-red-600' :
                            issue.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`px-2 py-1 rounded font-medium ${
                              issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {issue.severity?.toUpperCase()}
                            </span>
                            <span className="text-gray-500">{issue.category}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => autoFixIssue({ category: issue.category, severity: issue.severity, count: 1 })}
                        disabled={fixingIssues[issue.category]}
                        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {fixingIssues[issue.category] ? (
                          <>
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                            Fixing...
                          </>
                        ) : (
                          <>
                            <FiZap className="w-4 h-4" />
                            Get Recommendations
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                {currentScanIssues.length > 10 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate(`/seo-scan/${currentScanResults.id}`)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all {currentScanIssues.length} issues →
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentScanIssues.length === 0 && (
              <div className="text-center py-8">
                <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Issues Found!</h3>
                <p className="text-gray-600">Your website is in great shape.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Modal */}
      {showProgress && currentScanId && (
        <ScanProgressModal
          scanId={currentScanId}
          onComplete={async (results) => {
            setShowProgress(false);
            setScanning(false);
            loadDashboardData();
            loadSubscriptionUsage();
            
            // Load scan results inline instead of navigating
            try {
              const response = await fetch(`https://api.organitrafficboost.com/api/seo/scan/${currentScanId}?userId=${user.id}`);
              const data = await response.json();
              if (data.success) {
                setCurrentScanResults(data.scan);
                setCurrentScanIssues(data.issues || []);
                // Scroll to results
                setTimeout(() => {
                  document.getElementById('scan-results')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            } catch (error) {
              console.error('Error loading scan results:', error);
            }
          }}
          onClose={() => {
            setShowProgress(false);
            setScanning(false);
          }}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && limitData && (
        <UpgradeModal
          limitData={limitData}
          onClose={() => {
            setShowUpgradeModal(false);
            setLimitData(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className={`w-16 h-16 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ScanCard({ scan, getScoreColor, getScoreBg, navigate }) {
  return (
    <div 
      onClick={() => navigate(`/seo-scan/${scan.id}`)}
      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{scan.url}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              {new Date(scan.scanned_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <FiAlertCircle className="w-4 h-4 text-red-500" />
              {scan.critical_issues} Critical
            </span>
            <span className="text-yellow-600">{scan.warnings} Warnings</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg ${getScoreBg(scan.seo_score)}`}>
          <span className={`text-2xl font-bold ${getScoreColor(scan.seo_score)}`}>
            {scan.seo_score}
          </span>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue }) {
  const severityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <div className={`border rounded-lg p-4 ${severityColors[issue.severity]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold capitalize">{issue.category}</span>
        <span className="text-2xl font-bold">{issue.count}</span>
      </div>
      <span className="text-xs uppercase font-medium">{issue.severity}</span>
    </div>
  );
}
