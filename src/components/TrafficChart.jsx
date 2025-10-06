import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const TrafficChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        textStyle: {
          color: '#374151'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280'
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6'
          }
        }
      },
      series: [
        {
          name: 'Generated Traffic',
          type: 'line',
          smooth: true,
          data: [120, 132, 101, 134, 90, 230, 210],
          lineStyle: {
            color: '#3b82f6',
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.05)'
              }
            ])
          },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#3b82f6'
          }
        },
        {
          name: 'Successful Visits',
          type: 'line',
          smooth: true,
          data: [115, 128, 98, 130, 88, 225, 205],
          lineStyle: {
            color: '#10b981',
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(16, 185, 129, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(16, 185, 129, 0.05)'
              }
            ])
          },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#10b981'
          }
        }
      ],
      legend: {
        data: ['Generated Traffic', 'Successful Visits'],
        bottom: 0,
        textStyle: {
          color: '#6b7280'
        }
      }
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

export default TrafficChart;