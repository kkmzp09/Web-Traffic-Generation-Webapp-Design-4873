// src/components/SEOJourney.jsx
// Guided SEO Journey - Step-by-step website improvement

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { 
  Search, TrendingUp, Zap, AlertCircle, CheckCircle, 
  ArrowRight, RefreshCw, Target, BarChart2, Activity,
  Globe, Clock, Users, Award, ExternalLink
} from 'lucide-react';

const SEOJourney = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [auditResults, setAuditResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.organitrafficboost.com';

  // Comprehensive site audit
  const runComprehensiveAudit = async () => {
    if (!websiteUrl) return;

    try {
      setScanning(true);
      
      // Run multiple scans in parallel
      const [seoScan, gscData, domainData] = await Promise.all([
        // On-page SEO scan
        fetch(`${API_BASE}/api/seo/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: websiteUrl })
        }).then(r => r.json()).catch(() => null),

        // GSC data (if connected)
        user ? fetch(`${API_BASE}/api/seo/gsc/connections?userId=${user.id}`)
          .then(r => r.json()).catch(() => null) : null,

        // Domain analytics
        fetch(`${API_BASE}/api/seo/domain-metrics?domain=${new URL(websiteUrl).hostname}`)
          .then(r => r.json()).catch(() => null)
      ]);

      // Calculate comprehensive results
      const results = calculateAuditResults(seoScan, gscData, domainData);
      setAuditResults(results);
      
    } catch (error) {
      console.error('Audit error:', error);
    } finally {
      setScanning(false);
    }
  };

  // Calculate audit results and priority fixes
  const calculateAuditResults = (seoScan, gscData, domainData) => {
    const issues = {
      critical: [],
      warnings: [],
      good: []
    };

    let totalScore = 100;

    // Check traffic
    const hasTraffic = gscData?.connections?.length > 0;
    if (!hasTraffic) {
      issues.critical.push({
        title: 'No Traffic Data',
        description: 'Your website has no traffic tracking. Start getting visitors now!',
        impact: 'HIGH',
        action: 'Get Traffic',
        link: '/direct-traffic',
        icon: Users,
        color: 'red'
      });
      totalScore -= 25;
    }

    // Check keywords
    const hasKeywords = gscData?.connections?.length > 0;
    if (!hasKeywords) {
      issues.critical.push({
        title: 'No Keywords Ranking',
        description: 'Your site is not ranking for any keywords. Start SEO campaigns!',
        impact: 'HIGH',
        action: 'Start SEO Traffic',
        link: '/seo-traffic',
        icon: Target,
        color: 'red'
      });
      totalScore -= 20;
    }

    // Check technical SEO
    if (seoScan?.analysis) {
      const technicalIssues = seoScan.analysis.issues?.filter(i => 
        i.severity === 'high' || i.severity === 'critical'
      ) || [];

      if (technicalIssues.length > 0) {
        issues.warnings.push({
          title: `${technicalIssues.length} Technical SEO Issues`,
          description: 'Your site has technical problems affecting search rankings.',
          impact: 'MEDIUM',
          action: 'Fix with Automation',
          link: '/seo-dashboard',
          icon: Activity,
          color: 'yellow'
        });
        totalScore -= (technicalIssues.length * 2);
      }

      // Check page speed
      if (seoScan.analysis.performance?.score < 70) {
        issues.warnings.push({
          title: 'Slow Page Speed',
          description: 'Your website loads slowly, affecting user experience and SEO.',
          impact: 'MEDIUM',
          action: 'Install Performance Widget',
          link: '/widget-installation',
          icon: Zap,
          color: 'yellow'
        });
        totalScore -= 10;
      }

      // Check on-page SEO
      const onPageScore = seoScan.analysis.score || 0;
      if (onPageScore < 70) {
        issues.warnings.push({
          title: 'Poor On-Page SEO',
          description: 'Your content and meta tags need optimization.',
          impact: 'MEDIUM',
          action: 'Optimize Pages',
          link: '/onpage-seo',
          icon: CheckCircle,
          color: 'yellow'
        });
        totalScore -= 10;
      }
    }

    // Check domain metrics
    if (domainData?.metrics) {
      if (domainData.metrics.domain_rank < 30) {
        issues.warnings.push({
          title: 'Low Domain Authority',
          description: 'Your domain needs more quality backlinks and content.',
          impact: 'MEDIUM',
          action: 'View Analytics',
          link: '/domain-analytics',
          icon: BarChart2,
          color: 'yellow'
        });
        totalScore -= 5;
      }
    }

    // Add good items
    if (hasTraffic) {
      issues.good.push({
        title: 'Traffic Tracking Active',
        description: 'Google Search Console is connected and tracking.',
        icon: CheckCircle,
        color: 'green'
      });
    }

    if (seoScan?.analysis?.score >= 70) {
      issues.good.push({
        title: 'Good On-Page SEO',
        description: 'Your pages are well-optimized for search engines.',
        icon: CheckCircle,
        color: 'green'
      });
    }

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      issues,
      websiteUrl,
      scannedAt: new Date().toISOString(),
      domain: domainData?.metrics || {},
      seo: seoScan?.analysis || {}
    };
  };

  // Get current step to work on
  const getCurrentFix = () => {
    if (!auditResults) return null;
    
    const allIssues = [
      ...auditResults.issues.critical,
      ...auditResults.issues.warnings
    ];

    if (currentStep >= allIssues.length) return null;
    return allIssues[currentStep];
  };

  const currentFix = getCurrentFix();
  const totalFixes = auditResults ? 
    auditResults.issues.critical.length + auditResults.issues.warnings.length : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Your SEO Command Center
        </h1>
        <p className="text-xl text-gray-600">
          Enter your website and we'll guide you step-by-step to improve your rankings
        </p>
      </div>

      {/* Website Input */}
      {!auditResults && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Let's Analyze Your Website
              </h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={scanning}
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>

              <button
                onClick={runComprehensiveAudit}
                disabled={!websiteUrl || scanning}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Your Website...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Start Comprehensive Audit
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What we'll analyze:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Current traffic and visitor data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Keyword rankings and opportunities
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Technical SEO issues
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Page speed and performance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Domain authority and backlinks
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Audit Results */}
      {auditResults && (
        <>
          {/* SEO Health Score */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your SEO Health Score</h2>
                <p className="text-purple-100">{auditResults.websiteUrl}</p>
              </div>
              <button
                onClick={() => {
                  setAuditResults(null);
                  setCurrentStep(0);
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Scan Again
              </button>
            </div>

            <div className="flex items-center gap-8">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - auditResults.score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{auditResults.score}</div>
                    <div className="text-sm opacity-90">/ 100</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-300" />
                    <span className="text-sm opacity-90">Critical</span>
                  </div>
                  <div className="text-3xl font-bold">{auditResults.issues.critical.length}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm opacity-90">Warnings</span>
                  </div>
                  <div className="text-3xl font-bold">{auditResults.issues.warnings.length}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-sm opacity-90">Good</span>
                  </div>
                  <div className="text-3xl font-bold">{auditResults.issues.good.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guided Fix Journey */}
          {currentFix && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm font-medium text-purple-600 mb-1">
                    YOUR JOURNEY • STEP {currentStep + 1} OF {totalFixes}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Let's Fix This Issue
                  </h2>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: totalFixes }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full ${
                        idx < currentStep ? 'bg-green-500' :
                        idx === currentStep ? 'bg-purple-600' :
                        'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-${currentFix.color}-100 rounded-lg`}>
                    <currentFix.icon className={`w-8 h-8 text-${currentFix.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentFix.title}
                      </h3>
                      <span className={`px-3 py-1 bg-${currentFix.color}-100 text-${currentFix.color}-700 text-sm font-semibold rounded-full`}>
                        {currentFix.impact} IMPACT
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 mb-4">
                      {currentFix.description}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(currentFix.link)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
                      >
                        {currentFix.action}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Skip for Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Why this matters:</strong> Fixing this issue will improve your search rankings and bring more visitors to your website.
              </div>
            </div>
          )}

          {/* All Issues List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Issue List</h2>
            
            <div className="space-y-6">
              {/* Critical Issues */}
              {auditResults.issues.critical.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Critical Issues ({auditResults.issues.critical.length})
                  </h3>
                  <div className="space-y-3">
                    {auditResults.issues.critical.map((issue, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <issue.icon className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="font-semibold text-gray-900">{issue.title}</div>
                            <div className="text-sm text-gray-600">{issue.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(issue.link)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          {issue.action}
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {auditResults.issues.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Warnings ({auditResults.issues.warnings.length})
                  </h3>
                  <div className="space-y-3">
                    {auditResults.issues.warnings.map((issue, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3">
                          <issue.icon className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="font-semibold text-gray-900">{issue.title}</div>
                            <div className="text-sm text-gray-600">{issue.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(issue.link)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                        >
                          {issue.action}
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Good Items */}
              {auditResults.issues.good.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    What's Working Well ({auditResults.issues.good.length})
                  </h3>
                  <div className="space-y-3">
                    {auditResults.issues.good.map((issue, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <issue.icon className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{issue.title}</div>
                          <div className="text-sm text-gray-600">{issue.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SEOJourney;
