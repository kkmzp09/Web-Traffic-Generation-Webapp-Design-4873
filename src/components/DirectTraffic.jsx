import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import SafeIcon from '../common/SafeIcon';
    import * as FiIcons from 'react-icons/fi';
    import {
      startCampaign,
      checkCampaignStatus,
      getCampaignResults,
      checkServerHealth,
      buildCampaignRequest,
      handleApiError,
      getServerUrl,
    } from '../api';
    import { DEFAULT_SERVER_CONFIG } from '../config';

    const { FiZap, FiPlay, FiTarget, FiGlobe, FiBarChart, FiRefreshCw, FiCheckCircle, FiXCircle } = FiIcons;

    function DirectTraffic() {
      const [targetUrl, setTargetUrl] = useState('https://jobmakers.in');
      const [trafficAmount, setTrafficAmount] = useState(10);
      const [campaignStatus, setCampaignStatus] = useState('idle'); // idle, running, finished, error
      const [jobId, setJobId] = useState(null);
      const [results, setResults] = useState(null);
      const [progress, setProgress] = useState(0);

      const [serverStatus, setServerStatus] = useState('unknown');
      const [serverConfig] = useState(DEFAULT_SERVER_CONFIG);

      const checkApiConnection = async () => {
        setServerStatus('checking');
        try {
          await checkServerHealth(serverConfig);
          setServerStatus('ok');
        } catch (error) {
          setServerStatus('error');
          console.error(handleApiError(error, 'Health check'));
        }
      };

      useEffect(() => {
        checkApiConnection();
      }, []);

      const startPolling = (sessionId) => {
        const interval = setInterval(async () => {
          try {
            const statusData = await checkCampaignStatus(sessionId);
            setProgress(statusData.progress || 0);

            if (statusData.status === 'finished' || statusData.status === 'completed') {
              clearInterval(interval);
              setCampaignStatus('finished');
              setProgress(100);
              const finalResults = await getCampaignResults(sessionId);
              setResults(finalResults.results || finalResults);
            } else if (statusData.status === 'failed' || statusData.status === 'error') {
              clearInterval(interval);
              setCampaignStatus('error');
            }
          } catch (error) {
            console.error(handleApiError(error, 'Status check'));
            setCampaignStatus('error');
            clearInterval(interval);
          }
        }, 2000);

        // Stop polling after 2 minutes to prevent infinite loops
        setTimeout(() => {
          clearInterval(interval);
          if (campaignStatus === 'running') {
            setCampaignStatus('error'); // Assume timeout is an error
          }
        }, 120000);
      };

      const handleRunCampaign = async () => {
        setCampaignStatus('running');
        setResults(null);
        setProgress(0);
        setJobId(null);
        
        try {
          const urlList = Array(trafficAmount).fill(targetUrl);

          const payload = buildCampaignRequest({
            urls: urlList,
            dwellMs: 15000,
            scroll: true,
          });
          
          const response = await startCampaign(payload, serverConfig);
          
          if (response.id || response.sessionId) {
            const sessionId = response.id || response.sessionId;
            setJobId(sessionId);
            startPolling(sessionId);
          } else {
            throw new Error(response.message || 'Failed to get a campaign ID');
          }
        } catch (error) {
          setCampaignStatus('error');
          console.error(handleApiError(error, 'Campaign start'));
        }
      };

      const getStatusIndicator = () => {
        const statuses = {
          checking: { icon: FiZap, color: 'text-yellow-500', label: 'Checking API...', pulse: true },
          ok: { icon: FiZap, color: 'text-green-500', label: 'API Connected' },
          error: { icon: FiZap, color: 'text-red-500', label: 'API Unreachable' },
        };
        const currentStatus = statuses[serverStatus] || statuses.error;
        return (
          <div className={`flex items-center ${currentStatus.color}`}>
            <SafeIcon icon={currentStatus.icon} className={currentStatus.pulse ? 'animate-pulse' : ''} />
            <span className="ml-2 text-sm">{currentStatus.label}</span>
          </div>
        );
      };

      return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <SafeIcon icon={FiTarget} className="mr-3 text-red-500" />
                    Direct Traffic
                  </h1>
                  <p className="text-gray-500 mt-1">Send direct visits to a URL.</p>
                </div>
                {getStatusIndicator()}
              </div>

              <div className="space-y-6">
                {/* URL Input */}
                <motion.div
                  className="p-5 bg-gray-100 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <SafeIcon icon={FiGlobe} className="mr-2" />
                    Target URL
                  </label>
                  <input
                    type="text"
                    id="targetUrl"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com"
                  />
                </motion.div>

                {/* Traffic Amount */}
                <motion.div
                  className="p-5 bg-gray-100 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <label htmlFor="trafficAmount" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <SafeIcon icon={FiBarChart} className="mr-2" />
                    Traffic Amount
                  </label>
                  <input
                    type="range"
                    id="trafficAmount"
                    min="1"
                    max="100"
                    value={trafficAmount}
                    onChange={(e) => setTrafficAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="text-center text-lg font-semibold text-gray-800 mt-2">
                    {trafficAmount} visits
                  </div>
                </motion.div>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <motion.button
                  onClick={handleRunCampaign}
                  disabled={campaignStatus === 'running' || serverStatus !== 'ok'}
                  className="w-full py-3 px-4 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center justify-center">
                    <SafeIcon icon={campaignStatus === 'running' ? FiRefreshCw : FiPlay} className={campaignStatus === 'running' ? 'animate-spin' : ''} />
                    <span className="ml-2">{campaignStatus === 'running' ? 'Campaign Running...' : 'Run Campaign'}</span>
                  </div>
                </motion.button>
              </div>

              {/* Progress and Status */}
              {campaignStatus !== 'idle' && (
                <div className="mt-6 text-center">
                  {campaignStatus === 'running' && (
                    <div className="space-y-2">
                      <p className="text-blue-600">Campaign is in progress... (ID: {jobId ? jobId.slice(-8) : '...'})</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500">{progress}% complete</p>
                    </div>
                  )}
                  {campaignStatus === 'finished' && (
                    <div className="flex items-center justify-center text-green-600">
                      <SafeIcon icon={FiCheckCircle} className="mr-2" />
                      <p>Campaign finished successfully!</p>
                    </div>
                  )}
                  {campaignStatus === 'error' && (
                    <div className="flex items-center justify-center text-red-600">
                      <SafeIcon icon={FiXCircle} className="mr-2" />
                      <p>There was an error running the campaign.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Results */}
              {results && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-6 text-center text-xs text-gray-400">
                API Endpoint: {getServerUrl(serverConfig)}
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    export default DirectTraffic;