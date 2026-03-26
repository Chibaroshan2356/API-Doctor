import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';

interface ChartDataPoint {
  time: string;
  responseTime: number;
  errorRate?: number;
  status?: 'healthy' | 'down' | 'checking' | 'slow';
}

interface EnhancedChartProps {
  data: ChartDataPoint[];
  title?: string;
  type?: 'line' | 'area' | 'composed';
  height?: number;
  showErrorRate?: boolean;
  timeRange?: '1h' | '24h' | '7d';
}

export const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  title = 'Response Time Trend',
  type = 'line',
  height = 400,
  showErrorRate = false,
  timeRange = '24h'
}) => {
  const formatTime = (time: string) => {
    const date = new Date(time);
    switch (timeRange) {
      case '1h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case '24h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case '7d':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      default:
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {formatTime(label)}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Response Time: <span className="font-bold">{data.responseTime}ms</span>
          </p>
          {showErrorRate && data.errorRate !== undefined && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Error Rate: <span className="font-bold">{data.errorRate}%</span>
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Status: {data.status?.toUpperCase()}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatTime}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'composed':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatTime}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
            />
            {showErrorRate && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Error Rate (%)', angle: 90, position: 'insideRight' }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="responseTime"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5 }}
            />
            {showErrorRate && (
              <Bar
                yAxisId="right"
                dataKey="errorRate"
                fill="#ef4444"
                fillOpacity={0.3}
              />
            )}
          </ComposedChart>
        );

      default: // line
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatTime}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Response Time</span>
          </div>
          {showErrorRate && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Error Rate</span>
            </div>
          )}
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data available for selected time range</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      )}
    </div>
  );
};
