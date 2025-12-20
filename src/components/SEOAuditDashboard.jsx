// src/components/SEOAuditDashboard.jsx
// Comprehensive SEO Audit Dashboard - ClickRank Style

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import GSCAnalytics from './GSCAnalytics';
import SEODashboard from './SEODashboard';
import {
  Search, TrendingUp, AlertCircle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Zap, Target, BarChart2, Clock,
  Award, TrendingDown, ExternalLink, RefreshCw, Play
} from 'lucide-react';

const SEOAuditDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get('url');

  const [websiteUrl, setWebsiteUrl] = useState(urlParam || '');
  const [scanning, setScanning] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedPages, setExpandedPages] = useState({});
  const [fixingIssues, setFixingIssues] = useState({});
  const [scanHistory, setScanHistory] = useState([]);
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [newScanUrl, setNewScanUrl] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.organitrafficboost.com';

  useEffect(() => {
    // Load saved scan results from localStorage
    const savedScan = localStorage.getItem('lastScanResult');
    if (savedScan) {
      try {
        const parsed = JSON.parse(savedScan);
        setAuditData(parsed.auditData);
        setWebsiteUrl(parsed.websiteUrl);
      } catch (e) {
        console.error('Error loading saved scan:', e);
      }
    }
    
    if (urlParam) {
      runAudit(urlParam);
    }
    loadScanHistory();
  }, [urlParam]);

  // Load scan history when user becomes available
  useEffect(() => {
    if (user) {
      loadScanHistory();
    }
  }, [user]);

  // Load scan history
  const loadScanHistory = async () => {
    if (!user) {
      console.log('⚠️ No user, cannot load scan history');
      return;
    }

    try {
      console.log('📊 Loading scan history for user:', user.id);
      const url = `${API_BASE}/api/seo/scan-history?userId=${user.id}`;
      console.log('🔗 Fetching from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Scan history response:', data);
      
      if (data.success) {
        console.log(`✅ Found ${data.scans?.length || 0} scans in history`);
        setScanHistory(data.scans || []);
        
        // If no current scan loaded, load the most recent one
        if (!auditData && data.scans && data.scans.length > 0) {
          const latestScan = data.scans[0];
          console.log('📌 Loading latest scan:', latestScan.url);
          setAuditData({
            success: true,
            url: latestScan.url,
            hostname: new URL(latestScan.url).hostname,
            analysis: {
              score: latestScan.score,
              issues: latestScan.issues,
              summary: latestScan.summary,
              pageData: latestScan.page_data
            }
          });
          setWebsiteUrl(latestScan.url);
        }
      } else {
        console.log('❌ Scan history fetch failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading scan history:', error);
    }
  };

  // Load a specific scan from history
  const loadScanFromHistory = (scan) => {
    setAuditData({
      success: true,
      url: scan.url,
      hostname: new URL(scan.url).hostname,
      analysis: {
        score: scan.score,
        issues: scan.issues,
        summary: scan.summary,
        pageData: scan.page_data
      }
    });
    setWebsiteUrl(scan.url);
    setActiveTab('overview');
  };

  // Save scan results
  const saveScanResults = async (scanData) => {
    if (!user) return;

    try {
      await fetch(`${API_BASE}/api/seo/save-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          url: scanData.url,
          score: scanData.analysis.score,
          issues: scanData.analysis.issues,
          summary: scanData.analysis.summary,
          pageData: scanData.analysis.pageData
        })
      });
      
      loadScanHistory();
    } catch (error) {
      console.error('Error saving scan:', error);
    }
  };

  // Run comprehensive audit
  const runAudit = async (url = websiteUrl) => {
    if (!url) return;

    try {
      setScanning(true);
      console.log('🔍 Starting audit for:', url);

      const response = await fetch(`${API_BASE}/api/seo/comprehensive-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, userId: user?.id })
      });

      const data = await response.json();
      
      if (data.success) {
        setAuditData(data);
        console.log('✅ Audit complete:', data);
        
        // Save to localStorage for persistence
        localStorage.setItem('lastScanResult', JSON.stringify({
          auditData: data,
          websiteUrl: url,
          timestamp: new Date().toISOString()
        }));
        
        // Save scan results
        await saveScanResults(data);
      } else {
        alert('Failed to audit website. Please try again.');
      }
    } catch (error) {
      console.error('Audit error:', error);
      alert('An error occurred during the audit.');
    } finally {
      setScanning(false);
    }
  };

  // Handle new scan from modal
  const handleNewScan = async () => {
    if (!newScanUrl) {
      alert('Please enter a website URL');
      return;
    }

    // Add https:// if not present
    let url = newScanUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setShowNewScanModal(false);
    setNewScanUrl('');
    setWebsiteUrl(url);
    await runAudit(url);
  };

  // Refresh scan (reload from saved data)
  const refreshScan = async () => {
    if (scanHistory.length > 0) {
      const latestScan = scanHistory[0];
      setAuditData({
        success: true,
        url: latestScan.url,
        hostname: new URL(latestScan.url).hostname,
        scannedAt: latestScan.scanned_at,
        analysis: {
          score: latestScan.score,
          issues: latestScan.issues,
          summary: latestScan.summary,
          pageData: latestScan.page_data
        }
      });
      
      if (gscConnected) {
        fetchGSCKeywords();
      }
    }
  };

  // Toggle page expansion
  const togglePage = (pageUrl) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageUrl]: !prev[pageUrl]
    }));
  };

  // Auto-fix issue
  const autoFixIssue = async (issue, pageUrl) => {
    const key = `${pageUrl}-${issue.title}`;
    setFixingIssues(prev => ({ ...prev, [key]: true }));

    // Simulate fix (replace with actual fix logic)
    setTimeout(() => {
      setFixingIssues(prev => ({ ...prev, [key]: false }));
      alert(`✅ Fixed: ${issue.title}`);
      // Refresh audit
      runAudit();
    }, 2000);
  };

  // Calculate health score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 30) return 'bg-orange-100';
    return 'bg-red-100';
  };

  // Categorize issues
  const categorizeIssues = () => {
    if (!auditData?.analysis?.issues) return { errors: [], warnings: [], notices: [] };

    const errors = auditData.analysis.issues.filter(i => i.severity === 'critical');
    const warnings = auditData.analysis.issues.filter(i => i.severity === 'high');
    const notices = auditData.analysis.issues.filter(i => i.severity === 'medium' || i.severity === 'low');

    return { errors, warnings, notices };
  };

  const { errors, warnings, notices } = categorizeIssues();

  // Group issues by page (for now, all issues are for main page)
  const groupIssuesByPage = () => {
    if (!auditData?.analysis?.issues) return [];
    
    return [{
      url: auditData.url,
      errorCount: errors.length,
      issues: auditData.analysis.issues
    }];
  };

  const pages = groupIssuesByPage();

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!auditData && !scanning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SEO Audit Dashboard
            </h1>
            <p className="text-gray-600">
              Enter your website URL to start a comprehensive SEO analysis
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={() => runAudit()}
              disabled={!websiteUrl}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              Start SEO Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (scanning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Website...</h2>
          <p className="text-gray-600">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">OrganiTraffic</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewScanModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            New Scan
          </button>
          {scanHistory.length > 0 && (
            <div className="relative group">
              <button className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Scan History ({scanHistory.length})
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover:block z-50">
                <div className="p-2 max-h-96 overflow-y-auto">
                  {scanHistory.map((scan, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadScanFromHistory(scan)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 truncate">{scan.url}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(scan.scanned_at).toLocaleDateString()} at {new Date(scan.scanned_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                          scan.score >= 80 ? 'bg-green-100 text-green-700' :
                          scan.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {scan.score}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {scanHistory.length > 0 && (
            <button
              onClick={refreshScan}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
          <button
            onClick={() => runAudit()}
            disabled={scanning}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {scanning ? 'Scanning...' : 'Rescan Website'}
          </button>
        </div>
      </div>

      {/* Website Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{auditData.hostname}</h1>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Started: {new Date(auditData.scannedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Status: Completed
                </span>
              </div>
              <p className="text-gray-600 max-w-3xl">
                Comprehensive SEO analysis identifying technical issues, optimization opportunities, and actionable improvements for your website.
              </p>
            </div>

            {/* Health Score Gauge */}
            <div className="ml-8">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Website Health</div>
                <div className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(auditData.analysis.score)}`}>
                  <div className={`text-4xl font-bold ${getScoreColor(auditData.analysis.score)}`}>
                    {auditData.analysis.score}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {['overview', 'seo-automation', 'keywords', 'suggestions', 'performance', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'seo-automation' ? 'SEO Automation' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Audits Overview</h2>
                <p className="text-gray-600 mb-6">Overview of all audit problems</p>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Total Issues</span>
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{auditData.analysis.summary.total}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Critical</span>
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-3xl font-bold text-red-600">{auditData.analysis.summary.critical}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Health Score</span>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(auditData.analysis.score)}`}>
                      {auditData.analysis.score}%
                    </div>
                  </div>
                </div>

                {/* Credit Savings & Skipped Pages Info */}
                {auditData.pagesSkipped > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          💰 Smart Scan Optimization
                        </h3>
                        <p className="text-blue-700 mb-3">
                          We skipped <span className="font-bold">{auditData.pagesSkipped} page(s)</span> with pending issues to save your page credits!
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Pages Scanned</div>
                            <div className="text-2xl font-bold text-gray-900">{auditData.pagesScanned || 1}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">Credits Saved</div>
                            <div className="text-2xl font-bold text-green-600">{auditData.pagesSkipped}</div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-blue-600">
                          ℹ️ Pages with unfixed issues are automatically skipped to maximize your subscription value
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Distribution</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart2 className="w-16 h-16 text-gray-300" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo-automation' && (
              <SEODashboard />
            )}

            {activeTab === 'keywords' && (
              <GSCAnalytics />
            )}
          </div>
        </div>
      </div>

      {/* New Scan Modal */}
      {showNewScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan New Website</h2>
            <p className="text-gray-600 mb-6">Enter the URL of the website you want to analyze</p>
            
            <input
              type="text"
              value={newScanUrl}
              onChange={(e) => setNewScanUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNewScan()}
              placeholder="example.com or https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewScanModal(false);
                  setNewScanUrl('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewScan}
                disabled={!newScanUrl.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Start Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOAuditDashboard;
