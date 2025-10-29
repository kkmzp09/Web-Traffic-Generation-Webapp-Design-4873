// src/components/KeywordResearch.jsx
// Keyword Research & SERP Analyzer - See which sites rank for any keyword

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSubscription } from '../lib/subscriptionContext';

const { 
  FiSearch, FiLoader, FiExternalLink, FiTrendingUp, FiDollarSign,
  FiBarChart2, FiGlobe, FiAward, FiCopy, FiCheck, FiLock
} = FiIcons;

const KeywordResearch = () => {
  const { subscription, canUseKeywordResearch, useKeywordResearch } = useSubscription();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('United States');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [limitError, setLimitError] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const analyzeKeyword = async () => {
    if (!keyword.trim()) return;

    // Check subscription limit
    if (!canUseKeywordResearch()) {
      const limit = subscription?.limits?.keywordResearch || 0;
      const used = subscription?.usage?.keywordResearchQueries || 0;
      if (limit === -1) {
        // Unlimited - shouldn't happen
      } else {
        setLimitError(`You've reached your limit of ${limit} keyword research queries this month. Upgrade your plan for more queries.`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setLimitError(null);
    setResults(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/analyze-serp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          locationCode: 2840, // US
          languageCode: 'en',
          depth: 100
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update subscription usage
        useKeywordResearch();
        
        setResults(data);
      } else {
        setError(data.error || 'Failed to analyze keyword');
      }
    } catch (err) {
      console.error('Keyword Research Error:', err);
      setError('Failed to analyze keyword. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <SafeIcon icon={FiSearch} className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Keyword Research</h1>
              <p className="text-gray-600 mt-1">
                Discover which sites rank for any keyword
              </p>
            </div>
          </div>
          
          {/* Usage Stats */}
          {subscription && subscription.limits && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Research Queries</div>
              <div className="text-2xl font-bold text-gray-900">
                {subscription.usage?.keywordResearchQueries || 0} / {subscription.limits.keywordResearch === -1 ? '∞' : subscription.limits.keywordResearch}
              </div>
              {subscription.limits.keywordResearch !== -1 && (
                <div className="text-xs text-gray-500 mt-1">
                  {subscription.limits.keywordResearch - (subscription.usage?.keywordResearchQueries || 0)} remaining
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Limit Error */}
      {limitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <SafeIcon icon={FiLock} className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{limitError}</p>
            <button
              onClick={() => navigate('/pricing')}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyze Keyword</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Enter keyword (e.g., 'best seo tools')"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzeKeyword()}
            className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={analyzeKeyword}
            disabled={loading || !keyword.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSearch} className="w-5 h-5" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Keyword Metrics */}
          {results.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <SafeIcon icon={FiTrendingUp} className="w-4 h-4" />
                  <span className="text-sm font-medium">Search Volume</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(results.metrics.searchVolume)}
                </p>
                <p className="text-xs text-gray-500 mt-1">monthly searches</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <SafeIcon icon={FiDollarSign} className="w-4 h-4" />
                  <span className="text-sm font-medium">CPC</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${results.metrics.cpc?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">cost per click</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <SafeIcon icon={FiBarChart2} className="w-4 h-4" />
                  <span className="text-sm font-medium">Competition</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {results.metrics.competitionLevel || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {results.metrics.competition ? `${(results.metrics.competition * 100).toFixed(0)}%` : ''}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <SafeIcon icon={FiGlobe} className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Results</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {results.results.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">ranking sites</p>
              </div>
            </div>
          )}

          {/* Ranking Sites */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Ranking Sites for "{results.keyword}"
              </h2>
              {results.checkUrl && (
                <a
                  href={results.checkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                  Verify on Google
                </a>
              )}
            </div>

            <div className="space-y-4">
              {results.results.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                        result.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                        result.position <= 3 ? 'bg-blue-100 text-blue-800' :
                        result.position <= 10 ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        #{result.position}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {result.title}
                      </h3>

                      {/* URL */}
                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate"
                        >
                          {result.url}
                        </a>
                        <button
                          onClick={() => copyUrl(result.url)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy URL"
                        >
                          <SafeIcon 
                            icon={copiedUrl === result.url ? FiCheck : FiCopy} 
                            className={`w-4 h-4 ${copiedUrl === result.url ? 'text-green-600' : 'text-gray-400'}`}
                          />
                        </button>
                      </div>

                      {/* Domain */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {result.domain}
                        </span>
                        {result.isAmp && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                            AMP
                          </span>
                        )}
                        {result.rating && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                            <SafeIcon icon={FiAward} className="w-3 h-3" />
                            {result.rating.value} ({result.rating.votesCount})
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {result.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {results.results.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <SafeIcon icon={FiSearch} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600">Try a different keyword or location</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!results && !loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <SafeIcon icon={FiSearch} className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Discover Top Ranking Sites
          </h3>
          <p className="text-gray-600 mb-4">
            Enter any keyword to see which sites rank on Google
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-600" />
              See top 100 ranking sites
            </li>
            <li className="flex items-center gap-2">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-600" />
              Get search volume & CPC data
            </li>
            <li className="flex items-center gap-2">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-600" />
              Analyze competition level
            </li>
            <li className="flex items-center gap-2">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-600" />
              Discover competitor strategies
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default KeywordResearch;
