import React from 'react';

const TrafficChart = ({ data = [] }) => {
  // Process hourly data for display
  const processChartData = () => {
    if (!data || data.length === 0) {
      // Generate sample hours for empty state
      const hours = [];
      for (let i = 0; i < 24; i++) {
        hours.push({
          hour: i.toString().padStart(2, '0'),
          requestCount: 0,
          successCount: 0
        });
      }
      return hours;
    }
    
    return data.map(item => ({
      hour: item.hour.padStart(2, '0'),
      requestCount: parseInt(item.requestCount) || 0,
      successCount: parseInt(item.successCount) || 0,
      failureCount: (parseInt(item.requestCount) || 0) - (parseInt(item.successCount) || 0)
    }));
  };

  const chartData = processChartData();
  const maxRequests = Math.max(...chartData.map(d => d.requestCount), 1);
  const hasData = chartData.some(d => d.requestCount > 0);

  return (
    <div className="w-full h-64">
      {!hasData ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-medium">No traffic data yet</p>
            <p className="text-sm">Start campaigns to see hourly traffic patterns</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>{maxRequests}</span>
            <span>{Math.round(maxRequests * 0.75)}</span>
            <span>{Math.round(maxRequests * 0.5)}</span>
            <span>{Math.round(maxRequests * 0.25)}</span>
            <span>0</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-8 h-full">
            <div className="flex items-end justify-between h-full space-x-1">
              {chartData.map((item, index) => {
                const successHeight = maxRequests > 0 ? (item.successCount / maxRequests) * 100 : 0;
                const failureHeight = maxRequests > 0 ? (item.failureCount / maxRequests) * 100 : 0;
                
                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-48 min-w-0">
                      {/* Failure bar (red) */}
                      {failureHeight > 0 && (
                        <div 
                          className="w-full bg-red-400 rounded-t"
                          style={{ height: `${failureHeight}%` }}
                          title={`${item.hour}:00 - ${item.failureCount} failures`}
                        ></div>
                      )}
                      {/* Success bar (green) */}
                      {successHeight > 0 && (
                        <div 
                          className="w-full bg-green-400 rounded-t"
                          style={{ height: `${successHeight}%` }}
                          title={`${item.hour}:00 - ${item.successCount} successful requests`}
                        ></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-center">
                      {item.hour}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Successful</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>Failed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficChart;