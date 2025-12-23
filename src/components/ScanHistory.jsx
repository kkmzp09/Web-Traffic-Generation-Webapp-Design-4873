import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { 
  FiArrowLeft,
  FiClock,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiLoader,
  FiChevronRight
} from 'react-icons/fi';

export default function ScanHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain');

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    hasMore: false
  });

  useEffect(() => {
    if (user) {
      loadScanHistory();
    }
  }, [user, pagination.offset]);

  const loadScanHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: user.id,
        limit: pagination.limit,
        offset: pagination.offset
      });

      if (domain) {
        params.append('domain', domain);
      }

      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/scans/history?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setScans(data.scans);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore
        }));
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const formatDate = (dateString) => {
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

  if (loading && scans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading scan history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seo-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to SEO Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Scan History
              </h1>
            </div>
            {domain && (
              <p className="text-gray-600">
                Showing scans for: <span className="font-semibold">{domain}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {pagination.total} total scan{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Scans List */}
        {scans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No scan history yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start scanning your website to see results here
            </p>
            <button
              onClick={() => navigate('/seo-dashboard')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Start New Scan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <FiClock className="w-4 h-4" />
                        <span>{formatDate(scan.created_at)}</span>
                      </div>

                      {/* Domain */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {scan.domain}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 break-all">
                        {scan.url}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-indigo-600">
                            {scan.seo_score}/100
                          </div>
                          <span className="text-sm text-gray-600">Score</span>
                        </div>

                        <div className="h-8 w-px bg-gray-200"></div>

                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-900">{scan.critical_count}</span>
                          <span className="text-sm text-gray-600">Critical</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiAlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-900">{scan.warning_count}</span>
                          <span className="text-sm text-gray-600">Warning</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiInfo className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">{scan.info_count}</span>
                          <span className="text-sm text-gray-600">Info</span>
                        </div>

                        <div className="h-8 w-px bg-gray-200"></div>

                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">{scan.total_pages}</span> pages scanned
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => navigate(`/seo-scan/${scan.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                      >
                        View Details
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 inline animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
