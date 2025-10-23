// src/components/DomainComparison.jsx
// Side-by-side comparison of domain analytics

import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { exportComparisonToCSV } from '../utils/exportUtils';

const { FiX, FiTrendingUp, FiTrendingDown, FiMinus, FiDownload } = FiIcons;

const DomainComparison = ({ analyses, onClose }) => {
  if (!analyses || analyses.length < 2) {
    return null;
  }

  // Calculate changes between analyses
  const calculateChange = (oldVal, newVal) => {
    if (!oldVal || !newVal) return null;
    const change = ((newVal - oldVal) / oldVal) * 100;
    return change.toFixed(1);
  };

  const getChangeIcon = (change) => {
    if (!change) return FiMinus;
    return change > 0 ? FiTrendingUp : FiTrendingDown;
  };

  const getChangeColor = (change) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Domain Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">Comparing {analyses.length} analyses</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportComparisonToCSV(analyses)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Summary Comparison */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                    {analyses.map((analysis, idx) => (
                      <th key={idx} className="text-center py-3 px-4 font-semibold text-gray-700">
                        <div className="flex flex-col items-center">
                          <span className="text-sm">{analysis.domain}</span>
                          <span className="text-xs text-gray-500 font-normal">
                            {new Date(analysis.analyzed_at).toLocaleDateString()}
                          </span>
                        </div>
                      </th>
                    ))}
                    {analyses.length === 2 && (
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Change</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    label="Total Keywords"
                    values={analyses.map(a => a.total_keywords || 0)}
                    format={(v) => v.toLocaleString()}
                  />
                  <ComparisonRow
                    label="Organic Traffic"
                    values={analyses.map(a => a.organic_traffic || 0)}
                    format={(v) => v.toLocaleString()}
                  />
                  <ComparisonRow
                    label="Visibility Score"
                    values={analyses.map(a => a.visibility_score || 0)}
                    format={(v) => v.toFixed(2)}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Keywords Comparison */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyses.map((analysis, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{analysis.domain}</h4>
                  <div className="space-y-2">
                    {(analysis.top_keywords || []).slice(0, 5).map((kw, kwIdx) => (
                      <div key={kwIdx} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{kw.keyword}</span>
                        <span className="text-gray-500 ml-2">#{kw.position || kw.rank_absolute}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitors Comparison */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Competitors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyses.map((analysis, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{analysis.domain}</h4>
                  <div className="space-y-2">
                    {(analysis.competitors || []).slice(0, 5).map((comp, compIdx) => (
                      <div key={compIdx} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{comp.domain}</span>
                        <span className="text-gray-500 ml-2">{comp.intersections || comp.common_keywords}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for comparison rows
const ComparisonRow = ({ label, values, format }) => {
  const change = values.length === 2 ? calculateChange(values[0], values[1]) : null;
  
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-700">{label}</td>
      {values.map((value, idx) => (
        <td key={idx} className="py-3 px-4 text-center text-gray-900">
          {format ? format(value) : value}
        </td>
      ))}
      {change !== null && (
        <td className="py-3 px-4 text-center">
          <div className={`flex items-center justify-center gap-1 ${getChangeColor(change)}`}>
            <SafeIcon icon={getChangeIcon(change)} className="w-4 h-4" />
            <span className="font-medium">{Math.abs(change)}%</span>
          </div>
        </td>
      )}
    </tr>
  );
};

// Helper functions
function calculateChange(oldVal, newVal) {
  if (!oldVal || !newVal) return null;
  const change = ((newVal - oldVal) / oldVal) * 100;
  return change.toFixed(1);
}

function getChangeIcon(change) {
  if (!change) return FiMinus;
  return parseFloat(change) > 0 ? FiTrendingUp : FiTrendingDown;
}

function getChangeColor(change) {
  if (!change) return 'text-gray-500';
  return parseFloat(change) > 0 ? 'text-green-600' : 'text-red-600';
}

export default DomainComparison;
