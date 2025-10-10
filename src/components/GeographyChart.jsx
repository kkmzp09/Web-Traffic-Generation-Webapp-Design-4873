import React from 'react';

const GeographyChart = ({ data = [] }) => {
  // Process country data for display
  const processChartData = () => {
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.slice(0, 10).map(item => ({
      country: item.country,
      requestCount: parseInt(item.requestCount) || 0,
      successRate: parseFloat(item.successRate) || 0
    }));
  };

  const chartData = processChartData();
  const maxRequests = Math.max(...chartData.map(d => d.requestCount), 1);
  const hasData = chartData.length > 0;

  // Country flag emojis mapping
  const countryFlags = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'Australia': '🇦🇺',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Netherlands': '🇳🇱',
    'Brazil': '🇧🇷',
    'India': '🇮🇳',
    'China': '🇨🇳',
    'Russia': '🇷🇺',
    'South Korea': '🇰🇷'
  };

  return (
    <div className="w-full h-64">
      {!hasData ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <p className="font-medium">No geographic data yet</p>
            <p className="text-sm">Start campaigns to see country distribution</p>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto">
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const barWidth = maxRequests > 0 ? (item.requestCount / maxRequests) * 100 : 0;
              const flag = countryFlags[item.country] || '🌐';
              
              return (
                <div key={item.country} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 w-32 flex-shrink-0">
                    <span className="text-lg">{flag}</span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.country}
                    </span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-500 ${
                          item.successRate >= 80 ? 'bg-green-500' :
                          item.successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
                      <span className="text-white font-medium drop-shadow">
                        {item.requestCount.toLocaleString()}
                      </span>
                      <span className="text-gray-700 font-medium">
                        {item.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-16 text-right text-sm text-gray-600 flex-shrink-0">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>80%+ success</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>60-79% success</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>&lt;60% success</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeographyChart;