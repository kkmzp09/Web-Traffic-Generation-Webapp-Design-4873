import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { 
  FiAlertCircle, 
  FiAlertTriangle,
  FiInfo,
  FiZap, 
  FiArrowLeft, 
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiLoader,
  FiClock
} from 'react-icons/fi';

export default function AutoFixSEOResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [scan, setScan] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [applyingFixes, setApplyingFixes] = useState(new Set()); // Set of issueIds
  const [applyingPageFixes, setApplyingPageFixes] = useState(new Set()); // Set of pageIds

  useEffect(() => {
    if (scanId && user) {
      loadScanResults();
    }
  }, [scanId, user]);

  const loadScanResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/scans/${scanId}/pages`
      );
      const data = await response.json();

      if (data.success) {
        setScan(data.scan);
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Error loading scan results:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePageExpand = (pageId) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const applySingleFix = async (issue, pageId) => {
    const fixKey = `${issue.id}`;
    setApplyingFixes(prev => new Set([...prev, fixKey]));

    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/fixes/apply-single',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            issueId: issue.id,
            userId: user.id,
            scanId: parseInt(scanId)
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Optimistic update: mark issue as applied
        setPages(prevPages => 
          prevPages.map(page => 
            page.id === pageId
              ? {
                  ...page,
                  issues: page.issues.map(i => 
                    i.id === issue.id
                      ? { ...i, fix_status: 'applied' }
                      : i
                  )
                }
              : page
          )
        );
      }
    } catch (error) {
      console.error('Error applying fix:', error);
    } finally {
      setApplyingFixes(prev => {
        const newSet = new Set(prev);
        newSet.delete(fixKey);
        return newSet;
      });
    }
  };

  const applyPageFixes = async (page) => {
    setApplyingPageFixes(prev => new Set([...prev, page.id]));

    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/fixes/apply-page',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scanPageId: page.id,
            userId: user.id,
            scanId: parseInt(scanId)
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Optimistic update: mark all auto-fixable issues as applied
        setPages(prevPages => 
          prevPages.map(p => 
            p.id === page.id
              ? {
                  ...p,
                  issues: p.issues.map(i => 
                    i.auto_fixable && i.fix_status === 'not_fixed'
                      ? { ...i, fix_status: 'applied' }
                      : i
                  )
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error applying page fixes:', error);
    } finally {
      setApplyingPageFixes(prev => {
        const newSet = new Set(prev);
        newSet.delete(page.id);
        return newSet;
      });
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <FiAlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-600" />;
      default:
        return <FiInfo className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            onClick={() => navigate('/dashboard/seo')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to SEO Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  SEO Scan Results
                </h1>
                <p className="text-gray-600">{scan?.domain}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {scan?.score}/100
                </div>
                <p className="text-sm text-gray-500">{scan?.total_pages} pages scanned</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">{scan?.critical_count}</span>
                <span className="text-red-700">Critical</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900">{scan?.warning_count}</span>
                <span className="text-yellow-700">Warnings</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <FiInfo className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{scan?.info_count}</span>
                <span className="text-blue-700">Info</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/scan-history?domain=${encodeURIComponent(scan?.domain)}`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                <FiClock className="w-4 h-4 inline mr-2" />
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Pages List */}
        <div className="space-y-4">
          {pages.map((page) => {
            const isExpanded = expandedPages.has(page.id);
            const isApplyingPage = applyingPageFixes.has(page.id);
            const autoFixableCount = page.issues.filter(i => i.auto_fixable && i.fix_status === 'not_fixed').length;

            return (
              <div key={page.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Page Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => togglePageExpand(page.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <FiChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FiChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-lg font-bold text-gray-900">
                          {page.sequence_number}.
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-600 hover:text-indigo-800 break-all">
                          {page.page_url}
                        </p>
                        {page.page_title && (
                          <p className="text-xs text-gray-500 mt-1">{page.page_title}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {page.page_score}/100
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {page.critical_count > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {page.critical_count} Critical
                          </span>
                        )}
                        {page.warning_count > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {page.warning_count} Warning
                          </span>
                        )}
                        {page.info_count > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {page.info_count} Info
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isExpanded && autoFixableCount > 0 && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyPageFixes(page);
                        }}
                        disabled={isApplyingPage}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isApplyingPage ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <FiZap className="w-4 h-4" />
                            Fix All Safe Issues ({autoFixableCount})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Page Issues (Expanded) */}
                {isExpanded && (
                  <div className="px-6 pb-6 bg-gray-50">
                    {autoFixableCount > 0 && (
                      <div className="mb-4 pt-4">
                        <button
                          onClick={() => applyPageFixes(page)}
                          disabled={isApplyingPage}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {isApplyingPage ? (
                            <>
                              <FiLoader className="w-4 h-4 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <FiZap className="w-4 h-4" />
                              Fix All Safe Issues ({autoFixableCount})
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {page.issues.map((issue) => {
                        const fixKey = `${issue.id}`;
                        const isApplying = applyingFixes.has(fixKey);
                        const isApplied = issue.fix_status === 'applied' || issue.fix_status === 'verified';

                        return (
                          <div
                            key={issue.id}
                            className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1">
                                {getSeverityIcon(issue.severity)}
                              </div>

                              <div className="flex-1">
                                {/* Issue Header */}
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                      {issue.title}
                                    </h4>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadge(issue.severity)}`}>
                                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                                    </span>
                                  </div>
                                </div>

                                {/* Why it matters */}
                                {issue.why_it_matters && (
                                  <div className="mb-3 p-3 bg-white bg-opacity-60 rounded">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">
                                      Why it matters:
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      {issue.why_it_matters}
                                    </p>
                                  </div>
                                )}

                                {/* Current Value */}
                                {issue.current_value && (
                                  <div className="mb-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">
                                      Current:
                                    </p>
                                    <p className="text-sm text-gray-800 font-mono bg-white bg-opacity-60 p-2 rounded break-words">
                                      {issue.current_value}
                                    </p>
                                  </div>
                                )}

                                {/* Recommended Value */}
                                {issue.recommended_value && (
                                  <div className="mb-3">
                                    <p className="text-xs font-semibold text-green-700 mb-1">
                                      Recommended:
                                    </p>
                                    <p className="text-sm text-gray-800 font-mono bg-green-50 p-2 rounded break-words">
                                      {issue.recommended_value}
                                    </p>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-4">
                                  {isApplied ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg">
                                      <FiCheck className="w-4 h-4" />
                                      <span className="text-sm font-medium">Applied</span>
                                    </div>
                                  ) : issue.auto_fixable ? (
                                    <button
                                      onClick={() => applySingleFix(issue, page.id)}
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
                                          Auto Fix
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <div className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                      Manual Fix Required
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
