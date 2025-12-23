import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiZap, 
  FiArrowLeft, 
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiPlay,
  FiSkipForward,
  FiCheck,
  FiX,
  FiLoader
} from 'react-icons/fi';

export default function AutoFixSEOResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [scan, setScan] = useState(null);
  const [pageResults, setPageResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [applyingFixes, setApplyingFixes] = useState(new Set());
  const [appliedFixes, setAppliedFixes] = useState(new Set());
  const [previewingFix, setPreviewingFix] = useState(null);
  const [bulkApplying, setBulkApplying] = useState(false);
  const [widgetValidated, setWidgetValidated] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState(null);
  const [validatingWidget, setValidatingWidget] = useState(false);
  const [showWidgetWarning, setShowWidgetWarning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (scanId && user) {
      loadScanResults();
    }
  }, [scanId, user]);

  useEffect(() => {
    // Check if widget was already validated for this domain from database
    if (scan?.domain && user) {
      checkWidgetValidationStatus();
    }
  }, [scan, user]);

  const checkWidgetValidationStatus = async () => {
    try {
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/widget-validation-status?domain=${scan.domain}&userId=${user.id}`
      );
      const data = await response.json();
      
      if (data.success && data.validated) {
        setWidgetValidated(true);
        setWidgetStatus(data);
      }
    } catch (error) {
      console.error('Error checking widget status:', error);
    }
  };

  const loadScanResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/scan/${scanId}?userId=${user.id}`
      );
      const data = await response.json();

      if (data.success) {
        setScan(data.scan);
        
        // Group issues by page URL
        const issuesByPage = {};
        data.issues.forEach(issue => {
          const pageUrl = issue.page_url || data.scan.url;
          if (!issuesByPage[pageUrl]) {
            issuesByPage[pageUrl] = [];
          }
          issuesByPage[pageUrl].push(issue);
        });

        // Convert to array with page info
        const pages = Object.entries(issuesByPage).map(([url, issues], index) => ({
          serialNo: index + 1,
          url,
          issues,
          totalIssues: issues.length,
          criticalCount: issues.filter(i => i.severity === 'critical').length,
          warningCount: issues.filter(i => i.severity === 'warning').length
        }));

        setPageResults(pages);
      }
    } catch (error) {
      console.error('Error loading scan results:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateWidget = async () => {
    setValidatingWidget(true);
    
    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/validate-widget-strict',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: scan?.url,
            domain: scan?.domain,
            userId: user?.id
          })
        }
      );

      const data = await response.json();

      if (data.success && data.widgetInstalled) {
        setWidgetValidated(true);
        setWidgetStatus(data);
        setShowWidgetWarning(false);
        
        // Validation is already saved in database by the backend API
        
        return true;
      } else {
        setWidgetValidated(false);
        setWidgetStatus(data);
        setShowWidgetWarning(true);
        return false;
      }
    } catch (error) {
      console.error('Widget validation error:', error);
      setWidgetValidated(false);
      setShowWidgetWarning(true);
      return false;
    } finally {
      setValidatingWidget(false);
    }
  };

  const togglePageExpand = (serialNo) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(serialNo)) {
      newExpanded.delete(serialNo);
    } else {
      newExpanded.add(serialNo);
    }
    setExpandedPages(newExpanded);
  };

  const previewFix = async (issue) => {
    setPreviewingFix(issue);
  };

  const applyAutoFix = async (issue) => {
    // VALIDATE WIDGET FIRST
    if (!widgetValidated) {
      const isValid = await validateWidget();
      if (!isValid) {
        alert('⚠️ Widget not installed!\n\nPlease install the widget on your website before applying fixes.\n\nFixes will not work without the widget.');
        return;
      }
    }

    const fixKey = `${issue.page_url}-${issue.id}`;
    setApplyingFixes(new Set(applyingFixes).add(fixKey));

    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/apply-fix',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            scanId: scanId,
            issueId: issue.id,
            pageUrl: issue.page_url,
            fixType: 'auto'
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setAppliedFixes(new Set(appliedFixes).add(fixKey));
        setTimeout(() => {
          const newApplying = new Set(applyingFixes);
          newApplying.delete(fixKey);
          setApplyingFixes(newApplying);
        }, 500);
      }
    } catch (error) {
      console.error('Error applying fix:', error);
      const newApplying = new Set(applyingFixes);
      newApplying.delete(fixKey);
      setApplyingFixes(newApplying);
    }
  };

  const verifyAutoFix = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/verify-autofix',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scanId: scanId,
            url: scan?.url,
            domain: scan?.domain
          })
        }
      );

      const data = await response.json();
      setVerificationResult(data);

      if (data.success && data.verified) {
        alert(`✅ Verification Complete!\n\n${data.changeCount} changes detected:\n${data.changes?.map(c => `- ${c.field}: ${c.beforeLength || c.before} → ${c.afterLength || c.after}`).join('\n')}`);
      } else {
        alert('⚠️ Verification completed but no changes detected.\n\nThis might mean the page already meets SEO criteria.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('❌ Verification failed: ' + error.message);
    } finally {
      setVerifying(false);
    }
  };

  const applyAllSafeFixes = async () => {
    // VALIDATE WIDGET FIRST
    if (!widgetValidated) {
      const isValid = await validateWidget();
      if (!isValid) {
        alert('⚠️ Widget not installed!\n\nPlease install the widget on your website before applying fixes.\n\nFixes will not work without the widget.');
        return;
      }
    }

    setBulkApplying(true);

    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/apply-all-fixes',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            scanId: scanId
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Mark all as applied
        const allFixKeys = pageResults.flatMap(page =>
          page.issues.map(issue => `${issue.page_url}-${issue.id}`)
        );
        setAppliedFixes(new Set(allFixKeys));
        
        // Reload results
        await loadScanResults();

        // Ask if user wants to verify
        if (window.confirm('✅ Fixes applied successfully!\n\nWould you like to verify that the fixes are working on your website?')) {
          await verifyAutoFix();
        }
      }
    } catch (error) {
      console.error('Error applying all fixes:', error);
    } finally {
      setBulkApplying(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getNewContent = (issue) => {
    const currentValue = issue.current_value || '';
    
    switch (issue.title) {
      case 'Meta Description Too Short':
        return currentValue + ' Learn more about our comprehensive services, expert solutions, and how we can help you achieve your goals.';
      
      case 'Meta Description Too Long':
        return currentValue.substring(0, 157) + '...';
      
      case 'Title Too Short':
        return currentValue + ' | Professional Services';
      
      case 'Title Too Long':
        // Remove last section after separator
        const separators = [' - ', ' | ', ' – '];
        for (const sep of separators) {
          if (currentValue.includes(sep)) {
            const parts = currentValue.split(sep);
            parts.pop();
            return parts.join(sep);
          }
        }
        return currentValue.substring(0, 60);
      
      case 'Missing H1 Heading':
        return scan?.title || 'Welcome';
      
      case 'Missing Meta Description':
        return (scan?.title || 'Welcome') + ' - Discover more about our services and offerings.';
      
      case 'Missing Canonical Tag':
        return issue.page_url || scan?.url;
      
      case 'Incomplete Open Graph Tags':
        return 'og:title, og:description, og:url, og:type';
      
      case 'No Schema Markup':
        return 'WebPage schema with name, description, and URL';
      
      default:
        return 'Auto-fix will be applied';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading scan results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seo-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>

          {/* Widget Status Banner */}
          {!widgetValidated && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-lg">
              <div className="flex items-start">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                    Widget Installation Required
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    To apply SEO fixes automatically, install this widget code on your website:
                  </p>
                  
                  {/* Installation Code */}
                  <div className="bg-gray-900 rounded-lg p-4 mb-3 relative">
                    <code className="text-green-400 text-xs font-mono block overflow-x-auto">
                      {`<script src="https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=${scan?.domain || 'your-domain.com'}"></script>`}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `<script src="https://api.organitrafficboost.com/api/seo/widget/auto-fixes?domain=${scan?.domain}"></script>`
                        );
                        alert('✅ Code copied to clipboard!');
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>

                  <p className="text-xs text-yellow-700 mb-3">
                    Add this code to your website's <code className="bg-yellow-100 px-1 rounded">&lt;head&gt;</code> section or before the closing <code className="bg-yellow-100 px-1 rounded">&lt;/body&gt;</code> tag.
                  </p>

                  <button
                    onClick={validateWidget}
                    disabled={validatingWidget}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {validatingWidget ? (
                      <>
                        <FiLoader className="inline animate-spin mr-2" />
                        Validating...
                      </>
                    ) : (
                      'Validate Widget Installation'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {widgetValidated && widgetStatus && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-lg">
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-800 mb-1">
                    ✅ Widget Installed & Verified
                  </h3>
                  <p className="text-sm text-green-700 mb-3">
                    Widget detected on {scan?.url}. Fixes will be applied in real-time when users visit your website.
                  </p>
                  <button
                    onClick={verifyAutoFix}
                    disabled={verifying}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {verifying ? (
                      <>
                        <FiLoader className="inline animate-spin mr-2" />
                        Verifying Fixes...
                      </>
                    ) : (
                      '🔍 Verify Auto-Fix is Working'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Verification Results */}
          {verificationResult && verificationResult.verified && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-lg">
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">
                    ✅ Auto-Fix Verification Complete
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    {verificationResult.message}
                  </p>
                  {verificationResult.changes && verificationResult.changes.length > 0 && (
                    <div className="bg-white rounded p-3 text-sm">
                      <p className="font-semibold text-gray-700 mb-2">Detected Changes:</p>
                      <ul className="space-y-1">
                        {verificationResult.changes.map((change, i) => (
                          <li key={i} className="text-gray-600">
                            <span className="font-medium">{change.field}:</span>{' '}
                            {change.beforeLength !== undefined 
                              ? `${change.beforeLength} → ${change.afterLength} chars`
                              : `${change.before} → ${change.after}`
                            }
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  SEO Scan Results
                </h1>
                <p className="text-gray-600">{scan?.url}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {scan?.seo_score || 0}/100
                </div>
                <p className="text-sm text-gray-500">SEO Score</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {pageResults.length}
                </div>
                <div className="text-sm text-gray-600">Pages Scanned</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {pageResults.reduce((sum, p) => sum + p.criticalCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Critical Issues</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {pageResults.reduce((sum, p) => sum + p.warningCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={applyAllSafeFixes}
                disabled={bulkApplying}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {bulkApplying ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Applying All Fixes...
                  </>
                ) : (
                  <>
                    <FiZap />
                    Apply All Safe Fixes
                  </>
                )}
              </button>
              <button
                onClick={() => setExpandedPages(new Set(pageResults.map(p => p.serialNo)))}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Expand All
              </button>
              <button
                onClick={() => setExpandedPages(new Set())}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Page URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">
                    Current SEO Issues
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-64">
                    Recommended Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    Auto Fix
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageResults.map((page) => (
                  <React.Fragment key={page.serialNo}>
                    {/* Main Row */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => togglePageExpand(page.serialNo)}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {page.serialNo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {expandedPages.has(page.serialNo) ? (
                            <FiChevronDown className="text-gray-400" />
                          ) : (
                            <FiChevronRight className="text-gray-400" />
                          )}
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {page.url.length > 60 ? page.url.substring(0, 60) + '...' : page.url}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {page.criticalCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {page.criticalCount} Critical
                            </span>
                          )}
                          {page.warningCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {page.warningCount} Warnings
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Click to expand and see details
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePageExpand(page.serialNo);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Fixes
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedPages.has(page.serialNo) && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {page.issues.map((issue, idx) => {
                              const fixKey = `${issue.page_url}-${issue.id}`;
                              const isApplying = applyingFixes.has(fixKey);
                              const isApplied = appliedFixes.has(fixKey);

                              return (
                                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                                          {issue.severity}
                                        </span>
                                        <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                                      
                                      {issue.current_value && (
                                        <div className="bg-gray-50 rounded p-3 mb-3">
                                          <p className="text-xs text-gray-500 mb-1">Current Value:</p>
                                          <p className="text-sm text-gray-700 font-mono">{issue.current_value}</p>
                                        </div>
                                      )}

                                      <div className="bg-green-50 rounded p-3">
                                        <p className="text-xs text-green-700 font-semibold mb-1">New Content (After Auto-Fix):</p>
                                        <p className="text-sm text-green-800 font-mono break-words">{getNewContent(issue)}</p>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                      {isApplied ? (
                                        <>
                                          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                            <FiCheck className="w-4 h-4" />
                                            <span className="text-sm font-medium">Applied</span>
                                          </div>
                                          <button
                                            onClick={verifyAutoFix}
                                            disabled={verifying}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                          >
                                            {verifying ? (
                                              <>
                                                <FiLoader className="w-4 h-4 animate-spin" />
                                                Verifying...
                                              </>
                                            ) : (
                                              <>
                                                <FiCheck className="w-4 h-4" />
                                                Verify Fix
                                              </>
                                            )}
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => previewFix(issue)}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                                          >
                                            <FiEye className="w-4 h-4" />
                                            Preview Fix
                                          </button>
                                          <button
                                            onClick={() => applyAutoFix(issue)}
                                            disabled={isApplying}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                          >
                                            {isApplying ? (
                                              <>
                                                <FiLoader className="w-4 h-4 animate-spin" />
                                                Applying...
                                              </>
                                            ) : (
                                              <>
                                                <FiZap className="w-4 h-4" />
                                                Apply Auto Fix
                                              </>
                                            )}
                                          </button>
                                          <button
                                            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                                          >
                                            <FiSkipForward className="w-4 h-4" />
                                            Skip
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Modal */}
        {previewingFix && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Preview Fix</h3>
                  <button
                    onClick={() => setPreviewingFix(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{previewingFix.title}</h4>
                  <p className="text-sm text-gray-600">{previewingFix.description}</p>
                </div>

                {previewingFix.current_value && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current:</p>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-gray-800 font-mono">{previewingFix.current_value}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">After Fix (New Content):</p>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-gray-800 font-mono break-words">{getNewContent(previewingFix)}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      applyAutoFix(previewingFix);
                      setPreviewingFix(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    <FiZap />
                    Apply This Fix
                  </button>
                  <button
                    onClick={() => setPreviewingFix(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
