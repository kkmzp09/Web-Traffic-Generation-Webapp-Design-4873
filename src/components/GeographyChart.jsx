import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const GeographyChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    
    const data = [
      { name: 'United States', value: 25430 },
      { name: 'United Kingdom', value: 18920 },
      { name: 'Germany', value: 15680 },
      { name: 'France', value: 12340 },
      { name: 'Canada', value: 9870 },
      { name: 'Australia', value: 7650 },
      { name: 'Japan', value: 6540 },
      { name: 'Others', value: 15670 }
    ];

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        textStyle: {
          color: '#374151'
        }
      },
      series: [
        {
          name: 'Visitors by Country',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
            fontSize: 12,
            color: '#374151'
          },
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ],
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#6b7280']
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

export default GeographyChart;