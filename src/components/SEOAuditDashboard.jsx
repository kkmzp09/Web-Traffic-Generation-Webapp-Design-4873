// src/components/SEOAuditDashboard.jsx
// Comprehensive SEO Audit Dashboard - ClickRank Style

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import {
  Search, TrendingUp, AlertCircle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Zap, Target, BarChart2, Clock,
  Award, TrendingDown, ExternalLink, RefreshCw, Play
} from 'lucide-react';

const SEOAuditDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get('url');

  const [websiteUrl, setWebsiteUrl] = useState(urlParam || '');
  const [scanning, setScanning] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedPages, setExpandedPages] = useState({});
  const [fixingIssues, setFixingIssues] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.organitrafficboost.com';

  useEffect(() => {
    if (urlParam) {
      runAudit(urlParam);
    }
  }, [urlParam]);

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
        <button className="px-4 py-2 bg-white text-slate-800 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
          <Search className="w-4 h-4" />
          Fix Your Website Issues
        </button>
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
                Comprehensive SEO analysis identifying technical issues, optimization opportunities, and actionable improvements to boost your search rankings.
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
            {['overview', 'issues', 'keywords', 'suggestions', 'performance', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Issue Categories */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Errors */}
              <div className="mb-6">
                <div className="text-xs font-bold text-red-600 mb-3">ERRORS</div>
                <div className="space-y-2">
                  {errors.map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{issue.title}</span>
                      <span className="text-gray-500">{issue.count || 1}</span>
                    </div>
                  ))}
                  {errors.length === 0 && (
                    <div className="text-sm text-gray-500">No errors found</div>
                  )}
                </div>
              </div>

              {/* Warnings */}
              <div className="mb-6">
                <div className="text-xs font-bold text-orange-600 mb-3">WARNINGS</div>
                <div className="space-y-2">
                  {warnings.map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{issue.title}</span>
                      <span className="text-gray-500">{issue.count || 1}</span>
                    </div>
                  ))}
                  {warnings.length === 0 && (
                    <div className="text-sm text-gray-500">No warnings</div>
                  )}
                </div>
              </div>

              {/* Notices */}
              <div>
                <div className="text-xs font-bold text-blue-600 mb-3">NOTICES</div>
                <div className="space-y-2">
                  {notices.map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{issue.title}</span>
                      <span className="text-gray-500">{issue.count || 1}</span>
                    </div>
                  ))}
                  {notices.length === 0 && (
                    <div className="text-sm text-gray-500">No notices</div>
                  )}
                </div>
              </div>
            </div>
          </div>

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

                {/* Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Distribution</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart2 className="w-16 h-16 text-gray-300" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'issues' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {auditData.hostname}'s Top-Performing Pages
                </h2>
                <p className="text-gray-600 mb-6">
                  In-depth analysis of {auditData.hostname} highest-performing pages, evaluating crucial SEO metrics and identifying potential areas for improvement.
                </p>

                {/* Page Sections */}
                <div className="space-y-4">
                  {pages.map((page, pageIdx) => (
                    <div key={pageIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Page Header */}
                      <button
                        onClick={() => togglePage(page.url)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600 font-medium">{page.url}</span>
                          {page.errorCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                              {page.errorCount} Errors
                            </span>
                          )}
                        </div>
                        {expandedPages[page.url] ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Issue Table */}
                      {expandedPages[page.url] && (
                        <div className="border-t border-gray-200">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {page.issues.map((issue, issueIdx) => (
                                <tr key={issueIdx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm text-gray-900">{issue.description}</td>
                                  <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                      Passed
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {issue.autoFixAvailable ? (
                                      <button
                                        onClick={() => autoFixIssue(issue, page.url)}
                                        disabled={fixingIssues[`${page.url}-${issue.title}`]}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                      >
                                        {fixingIssues[`${page.url}-${issue.title}`] ? (
                                          <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Fixing...
                                          </>
                                        ) : (
                                          <>
                                            <Zap className="w-4 h-4" />
                                            Auto Optimize
                                          </>
                                        )}
                                      </button>
                                    ) : (
                                      <span className="text-sm text-gray-500">Manual fix required</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Keywords</h2>
                <p className="text-gray-600">GSC keyword integration coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOAuditDashboard;
