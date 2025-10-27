import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiAlertCircle, FiCheckCircle, FiZap, FiArrowLeft, FiRefreshCw, FiDownload } = FiIcons;

export default function SEOScanResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scan, setScan] = useState(null);
  const [issues, setIssues] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingFixes, setGeneratingFixes] = useState(false);
  const [applyingFix, setApplyingFix] = useState(null);
  const [applyingAll, setApplyingAll] = useState(false);
  const [autoFixing, setAutoFixing] = useState(null);

  useEffect(() => {
    if (scanId) {
      loadScanResults();
    }
  }, [scanId]);

  const loadScanResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/scan/${scanId}`
      );
      const data = await response.json();

      if (data.success) {
        setScan(data.scan);
        setIssues(data.issues);
        setFixes(data.fixes);
      }
    } catch (error) {
      console.error('Error loading scan results:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFixes = async () => {
    try {
      setGeneratingFixes(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/generate-fixes/${scanId}`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (data.success) {
        alert(`Generated ${data.count} AI-powered fix(es)!`);
        loadScanResults();
      } else {
        alert('Failed to generate fixes: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating fixes:', error);
      alert('Failed to generate fixes');
    } finally {
      setGeneratingFixes(false);
    }
  };

  const applyFix = async (fixId) => {
    if (!confirm('Apply this AI-generated fix?')) return;

    try {
      setApplyingFix(fixId);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/apply-fix/${fixId}`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'one_click' })
        }
      );
      const data = await response.json();

      if (data.success) {
        alert('Fix applied successfully!');
        loadScanResults();
      } else {
        alert('Failed to apply fix: ' + data.error);
      }
    } catch (error) {
      console.error('Error applying fix:', error);
      alert('Failed to apply fix');
    } finally {
      setApplyingFix(null);
    }
  };

  const applyAllFixes = async () => {
    const unappliedFixes = fixes.filter(f => !f.applied);
    
    if (unappliedFixes.length === 0) {
      alert('No fixes to apply!');
      return;
    }

    if (!confirm(`Apply all ${unappliedFixes.length} fix(es) at once?`)) return;

    try {
      setApplyingAll(true);
      let successCount = 0;
      let failCount = 0;

      for (const fix of unappliedFixes) {
        try {
          const response = await fetch(
            `https://api.organitrafficboost.com/api/seo/apply-fix/${fix.id}`,
            { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ method: 'bulk_apply' })
            }
          );
          const data = await response.json();
          
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      alert(`Applied ${successCount} fix(es) successfully!${failCount > 0 ? ` ${failCount} failed.` : ''}`);
      loadScanResults();
    } catch (error) {
      console.error('Error applying all fixes:', error);
      alert('Failed to apply fixes');
    } finally {
      setApplyingAll(false);
    }
  };

  // Determine if an issue can be auto-fixed via widget
  const isAutoFixable = (issue) => {
    const autoFixableCategories = ['title', 'meta', 'headings', 'images', 'schema', 'technical'];
    return autoFixableCategories.includes(issue.category);
  };

  // Apply auto-fix via widget
  const applyAutoFix = async (issue) => {
    try {
      setAutoFixing(issue.id);

      // Extract site ID from scan URL
      const urlObj = new URL(scan.url);
      const siteId = urlObj.hostname.replace(/\./g, '-') + '-001';

      // Prepare fix data based on issue type
      let fixData = {};
      if (issue.category === 'title') {
        fixData = { optimized_content: issue.recommendation || 'Optimized Title' };
      } else if (issue.category === 'meta') {
        fixData = { optimized_content: issue.recommendation || 'Optimized meta description' };
      } else if (issue.category === 'headings') {
        fixData = { optimized_content: issue.recommendation || 'Optimized H1 Heading' };
      } else if (issue.category === 'images') {
        fixData = { 
          optimized_content: 'Descriptive alt text',
          selector: 'img:not([alt])'
        };
      } else if (issue.category === 'schema') {
        fixData = {
          schema: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": urlObj.hostname,
            "url": scan.url
          }
        };
      }

      // Send to widget fixes API
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/widget/fixes/apply',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteId,
            domain: urlObj.hostname,
            scanId: parseInt(scanId),
            fixType: issue.category,
            fixData,
            priority: issue.severity === 'critical' ? 80 : 50
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('✅ Auto-fix enabled! The widget will apply this fix within 5 seconds.');
        loadScanResults();
      } else {
        alert('Failed to enable auto-fix: ' + data.error);
      }
    } catch (error) {
      console.error('Error enabling auto-fix:', error);
      alert('Failed to enable auto-fix');
    } finally {
      setAutoFixing(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 text-lg">Scan not found</p>
          <button
            onClick={() => navigate('/seo-dashboard')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter out issues that have applied fixes (to avoid confusing customers)
  const appliedFixCategories = fixes.filter(f => f.applied).map(f => {
    // Map fix types to issue categories
    const typeMap = {
      'title': 'title',
      'meta': 'meta',
      'headings': 'headings',
      'h1': 'headings',
      'content': 'content',
      'images': 'images'
    };
    return typeMap[f.fix_type];
  });

  const criticalIssues = issues.filter(i => 
    i.severity === 'critical' && !appliedFixCategories.includes(i.category)
  );
  const warnings = issues.filter(i => 
    i.severity === 'warning' && !appliedFixCategories.includes(i.category)
  );
  const fixableIssues = issues.filter(i => ['title', 'meta', 'images'].includes(i.category) && i.fix_status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seo-dashboard')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scan Results</h1>
          <p className="text-gray-600">{scan.url}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">SEO Score</h2>
              <p className="text-gray-600">
                Scanned on {new Date(scan.scanned_at).toLocaleString()}
              </p>
            </div>
            <div className={`w-32 h-32 rounded-full ${getScoreBg(scan.seo_score)} flex items-center justify-center`}>
              <span className={`text-5xl font-bold ${getScoreColor(scan.seo_score)}`}>
                {scan.seo_score}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{scan.critical_issues}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{scan.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{scan.passed_checks}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
          </div>
        </div>

        {/* AI Fix Generator */}
        {fixableIssues.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {fixes.length === 0 ? 'AI-Powered Auto-Fix Available' : 'Generate More AI Fixes'}
                </h3>
                <p className="text-indigo-100">
                  {fixes.length === 0 
                    ? `Generate optimized content for ${fixableIssues.length} issue(s) using AI`
                    : `Regenerate or create fixes for all ${fixableIssues.length} fixable issue(s)`
                  }
                </p>
              </div>
              <button
                onClick={generateFixes}
                disabled={generatingFixes}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50 flex items-center gap-2 font-semibold transition-all"
              >
                {generatingFixes ? (
                  <>
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiZap className="w-5 h-5" />
                    {fixes.length === 0 ? 'Generate Fixes' : 'Regenerate Fixes'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Fixes */}
        {fixes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">AI-Generated Fixes</h2>
              {fixes.filter(f => !f.applied).length > 0 && (
                <button
                  onClick={applyAllFixes}
                  disabled={applyingAll}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2 font-semibold transition-all shadow-md"
                >
                  {applyingAll ? (
                    <>
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      Applying All...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      Apply All Fixes ({fixes.filter(f => !f.applied).length})
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-4">
              {fixes.map((fix) => (
                <FixCard
                  key={fix.id}
                  fix={fix}
                  applyFix={applyFix}
                  applying={applyingFix === fix.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiAlertCircle className="text-red-600" />
              Critical Issues ({criticalIssues.length})
            </h2>
            <div className="space-y-4">
              {criticalIssues.map((issue) => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  severity="critical"
                  isAutoFixable={isAutoFixable(issue)}
                  applyAutoFix={applyAutoFix}
                  autoFixing={autoFixing === issue.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiAlertCircle className="text-yellow-600" />
              Warnings ({warnings.length})
            </h2>
            <div className="space-y-4">
              {warnings.map((issue) => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  severity="warning"
                  isAutoFixable={isAutoFixable(issue)}
                  applyAutoFix={applyAutoFix}
                  autoFixing={autoFixing === issue.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FixCard({ fix, applyFix, applying }) {
  const isSuggestion = ['headings', 'content', 'links'].includes(fix.fix_type);
  
  return (
    <div className="border border-green-200 rounded-lg p-6 bg-green-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 capitalize">
            {fix.fix_type} {isSuggestion ? 'Suggestions' : 'Optimization'}
          </h3>
          <div className="space-y-3">
            {fix.original_content && !isSuggestion && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Original:</span>
                <p className="text-sm text-gray-700 bg-white p-2 rounded mt-1">{fix.original_content}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-green-600 uppercase">
                {isSuggestion ? 'AI Suggestions:' : 'Optimized:'}
              </span>
              <div className="text-sm text-gray-900 bg-white p-3 rounded mt-1 whitespace-pre-line">
                {fix.optimized_content}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <span>Confidence: {Math.round(fix.confidence_score * 100)}%</span>
            <span>AI Model: {fix.ai_model}</span>
            {fix.character_count && <span>Length: {fix.character_count} chars</span>}
          </div>
        </div>
        {!fix.applied && (
          <button
            onClick={() => applyFix(fix.id)}
            disabled={applying}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-all"
          >
            {applying ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                {isSuggestion ? 'Mark as Reviewed' : 'Apply Fix'}
              </>
            )}
          </button>
        )}
        {fix.applied && (
          <div className="ml-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            {isSuggestion ? 'Reviewed' : 'Applied'}
          </div>
        )}
      </div>
    </div>
  );
}

function IssueCard({ issue, severity, isAutoFixable, applyAutoFix, autoFixing }) {
  const colors = {
    critical: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50'
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
          <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
          {issue.current_value && (
            <div className="text-xs text-gray-600 bg-white p-2 rounded mb-2">
              <span className="font-medium">Current: </span>
              {issue.current_value}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <div className="text-xs text-gray-500 capitalize">
              Category: {issue.category}
            </div>
            {isAutoFixable && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                ⚡ Auto-fixable via widget
              </span>
            )}
          </div>
        </div>
        {isAutoFixable && (
          <button
            onClick={() => applyAutoFix(issue)}
            disabled={autoFixing}
            className="ml-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-all shadow-md whitespace-nowrap"
          >
            {autoFixing ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <FiZap className="w-4 h-4" />
                Auto-Fix
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
