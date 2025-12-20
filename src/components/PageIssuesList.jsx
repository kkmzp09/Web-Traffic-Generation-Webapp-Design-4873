// src/components/PageIssuesList.jsx
// Page-level SEO issues list component

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';

const PageIssuesList = ({ pages }) => {
  const [expandedPages, setExpandedPages] = useState({});

  const togglePage = (pageId) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">No Page-Level Data Yet</h3>
        <p className="text-blue-700">
          Run a new audit to see detailed page-by-page SEO issues.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Page-Level Analysis</h3>
        <p className="text-gray-600 mb-4">
          Detailed SEO issues detected on each scanned page. Click to expand and see fixable issues.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Pages</div>
            <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Issues</div>
            <div className="text-2xl font-bold text-orange-600">
              {pages.reduce((sum, p) => sum + p.issueCount, 0)}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Fixable Issues</div>
            <div className="text-2xl font-bold text-green-600">
              {pages.reduce((sum, p) => sum + p.fixableCount, 0)}
            </div>
          </div>
        </div>
      </div>

      {pages.map((page) => (
        <div
          key={page.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Page Header */}
          <button
            onClick={() => togglePage(page.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">{page.title || page.url}</h4>
                {page.issueCount === 0 && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">{page.url}</div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-600">
                  {page.issueCount} {page.issueCount === 1 ? 'issue' : 'issues'}
                </span>
                {page.fixableCount > 0 && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Zap className="w-4 h-4" />
                    {page.fixableCount} fixable
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4">
              {expandedPages[page.id] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {/* Expanded Issues List */}
          {expandedPages[page.id] && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              {page.issueCount === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-700 font-medium">No SEO issues detected on this page!</p>
                  <p className="text-green-600 text-sm mt-1">This page follows SEO best practices.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {page.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-4 ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold">{issue.title}</h5>
                            {issue.fixable && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <Zap className="w-3 h-3" />
                                FIXABLE
                              </span>
                            )}
                            <span className="text-xs font-medium uppercase px-2 py-0.5 bg-white bg-opacity-50 rounded">
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{issue.description}</p>
                          {issue.impact && (
                            <div className="text-xs font-medium">
                              Impact: {issue.impact}
                            </div>
                          )}
                          {issue.currentValue && (
                            <div className="mt-2 text-xs bg-white bg-opacity-50 rounded p-2">
                              <span className="font-medium">Current: </span>
                              <span className="text-gray-700">{issue.currentValue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PageIssuesList;
