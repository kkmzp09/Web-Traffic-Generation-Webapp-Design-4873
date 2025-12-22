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

  useEffect(() => {
    if (scanId && user) {
      loadScanResults();
    }
  }, [scanId, user]);

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

  const applyAllSafeFixes = async () => {
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

  const getRecommendedAction = (issue) => {
    const actions = {
      'Missing H1 Heading': 'Add an H1 heading to the page',
      'Missing Meta Description': 'Add a meta description (120-160 characters)',
      'Meta Description Too Short': 'Expand meta description to 120-160 characters',
      'Meta Description Too Long': 'Shorten meta description to under 160 characters',
      'Title Too Short': 'Expand title to 50-60 characters',
      'Title Too Long': 'Shorten title to under 60 characters',
      'Missing Canonical Tag': 'Add canonical link tag to prevent duplicate content',
      'Incomplete Open Graph Tags': 'Add missing Open Graph meta tags for social sharing',
      'No Schema Markup': 'Add Schema.org structured data markup',
      'No Internal Links': 'Add internal links to improve site navigation'
    };
    return actions[issue.title] || 'Review and optimize this element';
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
                                        <p className="text-xs text-green-700 font-semibold mb-1">Recommended Action:</p>
                                        <p className="text-sm text-green-800">{getRecommendedAction(issue)}</p>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                      {isApplied ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                          <FiCheck className="w-4 h-4" />
                                          <span className="text-sm font-medium">Applied</span>
                                        </div>
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
                  <p className="text-sm font-medium text-gray-700 mb-2">After Fix:</p>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-gray-800">{getRecommendedAction(previewingFix)}</p>
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
