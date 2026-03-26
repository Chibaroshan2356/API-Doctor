import React, { useState, useMemo } from 'react';
import DualAxisLineChart from '../components/DualAxisLineChartFinal';

interface ChartDataPoint {
  time: string;
  responseTime: number;
  errorRate: number;
  errorCount?: number;
}

const ChartDemo: React.FC = () => {
  // Generate sample data using useMemo to avoid impure function warnings
  const sampleData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const responseTime = Math.floor(Math.random() * 200) + 80;
      const errorRate = Math.random() * 5;
      const errorCount = Math.round((errorRate / 100) * 1000);
      
      data.push({
        time: time.toISOString(),
        responseTime,
        errorRate,
        errorCount
      });
    }
    
    return data;
  }, []);

  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          📊 Enhanced Dual-Axis Line Chart Demo
        </h1>
        
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Range:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <DualAxisLineChart
          data={sampleData}
          title="API Performance Metrics"
          height={500}
          timeRange={timeRange}
          showGrid={true}
          showLegend={true}
          colors={{
            responseTime: '#3b82f6',
            errorRate: '#ef4444',
            grid: '#e5e7eb'
          }}
        />

        {/* Features List */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Chart Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">📈 Data Visualization</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Dual Y-axis (Response Time + Error Rate)</li>
                <li>• Smooth monotone curves</li>
                <li>• Responsive design</li>
                <li>• Animated transitions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">🎨 Interactive Features</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Custom tooltips with detailed info</li>
                <li>• Hover effects on data points</li>
                <li>• Time range filtering</li>
                <li>• Color-coded legends</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            💻 Usage Example
          </h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-800 dark:text-gray-200">
{`import DualAxisLineChart from './components/DualAxisLineChartFixed';

const data = [
  {
    time: '2024-01-01T00:00:00Z',
    responseTime: 120,
    errorRate: 2.5,
    errorCount: 25
  },
  // ... more data points
];

<DualAxisLineChart
  data={data}
  title="API Performance"
  height={400}
  timeRange="24h"
  showGrid={true}
  showLegend={true}
  colors={{
    responseTime: '#3b82f6',
    errorRate: '#ef4444',
    grid: '#e5e7eb'
  }}
/>`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ChartDemo;
