import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
  time: string;
  responseTime: number;
  errorRate: number;
  errorCount?: number;
  timestamp?: string;
}

interface DualAxisLineChartProps {
  data: ChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  timeRange?: '1h' | '24h' | '7d';
  colors?: {
    responseTime?: string;
    errorRate?: string;
    grid?: string;
  };
  title?: string;
}

// Custom tooltip component
const CustomTooltip = (props: any) => {
  const { active, payload } = props;
  
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    const responseTime = payload.find((p: any) => p.dataKey === 'responseTime')?.value || 0;
    const errorRate = payload.find((p: any) => p.dataKey === 'errorRate')?.value || 0;
    const errorCount = data.errorCount || Math.round((errorRate / 100) * 1000);

    // Format time
    const date = new Date(data.time);
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          📅 {formattedTime}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Response Time:
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {responseTime}ms
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Error Rate:
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {errorRate.toFixed(2)}%
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Error Count:
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {errorCount}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DualAxisLineChart: React.FC<DualAxisLineChartProps> = ({
  data,
  height = 400,
  showGrid = true,
  showLegend = true,
  timeRange = '24h',
  colors = {
    responseTime: '#3b82f6',
    errorRate: '#ef4444',
    grid: '#e5e7eb'
  },
  title
}) => {
  // Format time based on range
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    
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

  // Format Y-axis labels
  const formatResponseTime = (value: number) => `${value}ms`;
  const formatErrorRate = (value: number) => `${value}%`;

  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={colors.grid}
                strokeOpacity={0.3}
                vertical={true}
                horizontal={true}
              />
            )}
            
            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              tick={{
                fill: '#6b7280',
                fontSize: 12,
              }}
              tickLine={{
                stroke: '#9ca3af',
                strokeWidth: 1,
              }}
              axisLine={{
                stroke: '#9ca3af',
                strokeWidth: 1,
              }}
            />
            
            {/* Left Y-axis for Response Time */}
            <YAxis
              yAxisId="responseTime"
              orientation="left"
              tickFormatter={formatResponseTime}
              tick={{
                fill: '#6b7280',
                fontSize: 12,
              }}
              tickLine={{
                stroke: '#9ca3af',
                strokeWidth: 1,
              }}
              axisLine={{
                stroke: '#9ca3af',
                strokeWidth: 1,
              }}
              label={{
                value: 'Response Time (ms)',
                angle: -90,
                position: 'insideLeft',
                style: {
                  fill: '#6b7280',
                  fontSize: 12,
                },
              }}
            />
            
            {/* Right Y-axis for Error Rate */}
            <YAxis
              yAxisId="errorRate"
              orientation="right"
              tickFormatter={formatErrorRate}
              tick={{
                fill: '#6b7280',
                fontSize: 12,
              }}
              tickLine={{
                stroke: '#9ca3af',
                strokeWidth: 1,
              }}
              axisLine={{
                stroke: '#9ca3af',
                strokeWidth: 1,
              }}
              label={{
                value: 'Error Rate (%)',
                angle: 90,
                position: 'insideRight',
                style: {
                  fill: '#6b7280',
                  fontSize: 12,
                },
              }}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              contentStyle={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
              }}
            />
            
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                }}
                iconType="line"
                formatter={(value) => {
                  if (value === 'responseTime') return 'Response Time';
                  if (value === 'errorRate') return 'Error Rate';
                  return value;
                }}
              />
            )}
            
            {/* Response Time Line */}
            <Line
              yAxisId="responseTime"
              type="monotone"
              dataKey="responseTime"
              stroke={colors.responseTime}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: colors.responseTime,
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            
            {/* Error Rate Line */}
            <Line
              yAxisId="errorRate"
              type="monotone"
              dataKey="errorRate"
              stroke={colors.errorRate}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: colors.errorRate,
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DualAxisLineChart;
