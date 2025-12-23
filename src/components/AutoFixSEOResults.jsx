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
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink
} from 'react-icons/fi';

export default function AutoFixSEOResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [scan, setScan] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [applyingFixes, setApplyingFixes] = useState(new Set()); // Set of pageIds
  const [validatingPages, setValidatingPages] = useState(new Set()); // Set of pageIds
  const [error, setError] = useState(null);

  useEffect(() => {
    if (scanId && user) {
      loadScanResults();
    }
  }, [scanId, user]);

  const loadScanResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/scans/${scanId}/pages`
      );
      const data = await response.json();

      if (data.success) {
        setScan(data.scan);
        setPages(data.pages);
      } else {
        setError(data.error || 'Failed to load scan results');
      }
    } catch (error) {
      console.error('Error loading scan results:', error);
      setError('Failed to load scan results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpand = (pageId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedRows(newExpanded);
  };

  const applyPageFixes = async (page) => {
    setApplyingFixes(prev => new Set([...prev, page.id]));
    setError(null);

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
        // Update page state
        setPages(prevPages => 
          prevPages.map(p => 
            p.id === page.id
              ? {
                  ...p,
                  fix_applied: true,
                  applied_at: new Date().toISOString(),
                  issues: p.issues.map(i => 
                    i.auto_fixable && i.fix_status === 'not_fixed'
                      ? { ...i, fix_status: 'applied' }
                      : i
                  )
                }
              : p
          )
        );
      } else {
        setError(`Failed to apply fixes: ${data.error}`);
      }
    } catch (error) {
      console.error('Error applying fixes:', error);
      setError('Failed to apply fixes. Please try again.');
    } finally {
      setApplyingFixes(prev => {
        const newSet = new Set(prev);
        newSet.delete(page.id);
        return newSet;
      });
    }
  };

  const validatePageFixes = async (page) => {
    setValidatingPages(prev => new Set([...prev, page.id]));
    setError(null);

    try {
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/verify-autofix',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scanId: parseInt(scanId),
            url: page.page_url,
            domain: scan.domain
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update validation state
        setPages(prevPages => 
          prevPages.map(p => 
            p.id === page.id
              ? {
                  ...p,
                  validation_status: data.allFixed ? 'validated' : 'failed',
                  validated_at: new Date().toISOString(),
                  validation_details: data
                }
              : p
          )
        );
      } else {
        setError(`Validation failed: ${data.error}`);
        setPages(prevPages => 
          prevPages.map(p => 
            p.id === page.id
              ? { ...p, validation_status: 'failed', validated_at: new Date().toISOString() }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error validating fixes:', error);
      setError('Failed to validate fixes. Please try again.');
      setPages(prevPages => 
        prevPages.map(p => 
          p.id === page.id
            ? { ...p, validation_status: 'failed' }
            : p
        )
      );
    } finally {
      setValidatingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(page.id);
        return newSet;
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const hasAutoFixableIssues = (page) => {
    return page.issues.some(i => i.auto_fixable && i.fix_status === 'not_fixed');
  };

  const allIssuesFixed = (page) => {
    const autoFixable = page.issues.filter(i => i.auto_fixable);
    if (autoFixable.length === 0) return false;
    return autoFixable.every(i => i.fix_status === 'applied' || i.fix_status === 'verified');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getNextScanDate = (lastScanDate) => {
    if (!lastScanDate) return 'Not scheduled';
    const date = new Date(lastScanDate);
    date.setDate(date.getDate() + 7);
    return formatDateTime(date.toISOString());
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/seo-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to SEO Dashboard
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  SEO Scan Results
                </h1>
                <p className="text-gray-600">{scan?.domain}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {scan?.score}/100
                </div>
                <p className="text-sm text-gray-500">{scan?.total_pages} pages scanned</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <FiXCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                    SL No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Page URL
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                    SEO Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Google Rank
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                    Fix Available
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">
                    Action
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">
                    Validation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">
                    Last Scan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">
                    Next Scan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                      No pages found for this scan
                    </td>
                  </tr>
                ) : (
                  pages.map((page) => {
                    const isExpanded = expandedRows.has(page.id);
                    const isApplying = applyingFixes.has(page.id);
                    const isValidating = validatingPages.has(page.id);
                    const hasFixable = hasAutoFixableIssues(page);
                    const isFixed = allIssuesFixed(page) || page.fix_applied;

                    return (
                      <React.Fragment key={page.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          {/* SL No */}
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {page.sequence_number}
                          </td>

                          {/* Page URL */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRowExpand(page.id)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-2"
                              >
                                {isExpanded ? (
                                  <FiChevronDown className="w-4 h-4" />
                                ) : (
                                  <FiChevronRight className="w-4 h-4" />
                                )}
                                <span className="truncate max-w-md">{page.page_url}</span>
                              </button>
                              <a
                                href={page.page_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <FiExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            {page.issues.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {page.critical_count > 0 && <span className="text-red-600">{page.critical_count} Critical</span>}
                                {page.critical_count > 0 && page.warning_count > 0 && <span className="mx-1">•</span>}
                                {page.warning_count > 0 && <span className="text-yellow-600">{page.warning_count} Warning</span>}
                              </div>
                            )}
                          </td>

                          {/* SEO Score */}
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(page.page_score)}`}>
                              {page.page_score}/100
                            </span>
                          </td>

                          {/* Google Rank */}
                          <td className="px-4 py-4 text-center">
                            <span className="text-xs text-gray-400 italic">Coming Soon</span>
                          </td>

                          {/* Fix Available */}
                          <td className="px-4 py-4 text-center">
                            {hasFixable ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                No
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="px-4 py-4 text-center">
                            {isFixed ? (
                              <button
                                disabled
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-not-allowed"
                              >
                                <FiCheck className="w-4 h-4" />
                                Applied
                              </button>
                            ) : hasFixable ? (
                              <button
                                onClick={() => applyPageFixes(page)}
                                disabled={isApplying}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                              >
                                {isApplying ? (
                                  <>
                                    <FiLoader className="w-4 h-4 animate-spin" />
                                    Applying...
                                  </>
                                ) : (
                                  <>
                                    <FiZap className="w-4 h-4" />
                                    Auto Apply
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">Manual Fix</span>
                            )}
                          </td>

                          {/* Validation Status */}
                          <td className="px-4 py-4 text-center">
                            {!isFixed ? (
                              <span className="text-xs text-gray-400">-</span>
                            ) : page.validation_status === 'validated' ? (
                              <button
                                disabled
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-not-allowed"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                                Validated
                              </button>
                            ) : page.validation_status === 'failed' ? (
                              <button
                                onClick={() => validatePageFixes(page)}
                                disabled={isValidating}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                              >
                                <FiXCircle className="w-4 h-4" />
                                Retry
                              </button>
                            ) : (
                              <button
                                onClick={() => validatePageFixes(page)}
                                disabled={isValidating}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 text-sm font-medium"
                              >
                                {isValidating ? (
                                  <>
                                    <FiLoader className="w-4 h-4 animate-spin" />
                                    Validating...
                                  </>
                                ) : (
                                  <>
                                    <FiCheckCircle className="w-4 h-4" />
                                    Validate Fix
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                          {/* Last Scan */}
                          <td className="px-4 py-4 text-xs text-gray-600">
                            {formatDateTime(page.created_at)}
                          </td>

                          {/* Next Scan */}
                          <td className="px-4 py-4 text-xs text-gray-600">
                            <div>
                              {getNextScanDate(page.created_at)}
                            </div>
                            <div className="text-gray-400 mt-0.5">(Every 7 days)</div>
                          </td>
                        </tr>

                        {/* Expanded Row - Issues Detail */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="9" className="px-4 py-4 bg-gray-50">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  SEO Issues ({page.issues.length})
                                </h4>
                                {page.issues.map((issue) => (
                                  <div
                                    key={issue.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 mt-1">
                                        {issue.severity === 'critical' && <FiAlertCircle className="w-5 h-5 text-red-600" />}
                                        {issue.severity === 'warning' && <FiAlertTriangle className="w-5 h-5 text-yellow-600" />}
                                        {issue.severity === 'info' && <FiInfo className="w-5 h-5 text-blue-600" />}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h5 className="font-medium text-gray-900">{issue.title}</h5>
                                          <span className={`text-xs px-2 py-0.5 rounded ${
                                            issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                            issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                          }`}>
                                            {issue.severity}
                                          </span>
                                          {issue.fix_status === 'applied' && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                                              Fixed
                                            </span>
                                          )}
                                        </div>
                                        {issue.why_it_matters && (
                                          <p className="text-sm text-gray-700 mb-2">{issue.why_it_matters}</p>
                                        )}
                                        {issue.current_value && (
                                          <div className="text-xs mb-2">
                                            <span className="font-medium text-gray-600">Current: </span>
                                            <span className="text-gray-800">{issue.current_value}</span>
                                          </div>
                                        )}
                                        {issue.recommended_value && (
                                          <div className="text-xs">
                                            <span className="font-medium text-green-600">Recommended: </span>
                                            <span className="text-gray-800">{issue.recommended_value}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
