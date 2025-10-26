import React, { useState, useEffect } from 'react';

const ScanProgressModal = ({ scanId, onComplete, onClose }) => {
  const [progress, setProgress] = useState({
    status: 'crawling',
    pagesDiscovered: 0,
    pagesScanned: 0,
    totalPages: 0,
    currentPage: null,
    estimatedTimeRemaining: null
  });

  useEffect(() => {
    if (!scanId) return;

    // Connect to Server-Sent Events for real-time progress
    const eventSource = new EventSource(
      `https://api.organitrafficboost.com/api/seo/scan-progress/${scanId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data);

        // If scan is completed, close after a delay
        if (data.status === 'completed') {
          setTimeout(() => {
            eventSource.close();
            onComplete(data.results);
          }, 2000);
        }

        // If scan failed, close immediately
        if (data.status === 'failed') {
          eventSource.close();
          alert('❌ Scan failed: ' + (data.errors[0] || 'Unknown error'));
          onClose();
        }
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [scanId, onComplete, onClose]);

  const getProgressPercentage = () => {
    if (progress.status === 'crawling') {
      if (!progress.totalPages || progress.totalPages === 0) {
        // During crawling, show indeterminate progress
        return Math.min((progress.pagesDiscovered / 10) * 50, 50);
      }
      return Math.min((progress.pagesDiscovered / progress.totalPages) * 50, 50);
    }
    if (progress.status === 'scanning') {
      if (!progress.totalPages || progress.totalPages === 0) return 50;
      return 50 + (progress.pagesScanned / progress.totalPages) * 50;
    }
    if (progress.status === 'completed') {
      return 100;
    }
    return 0;
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'Calculating...';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const percentage = getProgressPercentage();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1f2937' }}>
            {progress.status === 'crawling' && '🔍 Discovering Pages...'}
            {progress.status === 'scanning' && '📊 Scanning Pages...'}
            {progress.status === 'completed' && '✅ Scan Complete!'}
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            {progress.status === 'crawling' && `Found ${progress.pagesDiscovered} pages`}
            {progress.status === 'scanning' && `${progress.pagesScanned} of ${progress.totalPages} pages scanned`}
            {progress.status === 'completed' && 'Processing results...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: '#e5e7eb',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: progress.status === 'completed' ? '#10b981' : '#3b82f6',
            transition: 'width 0.3s ease',
            borderRadius: '6px'
          }} />
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {isNaN(percentage) ? '0' : Math.round(percentage)}%
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Progress
            </div>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {formatTime(progress.estimatedTimeRemaining)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Time Remaining
            </div>
          </div>
        </div>

        {/* Current Page */}
        {progress.currentPage && progress.status === 'scanning' && (
          <div style={{
            padding: '12px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
              Currently scanning:
            </div>
            <div style={{
              fontSize: '12px',
              color: '#3b82f6',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {progress.currentPage}
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {progress.status !== 'completed' && (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          >
            Run in Background
          </button>
        )}
      </div>
    </div>
  );
};

export default ScanProgressModal;
