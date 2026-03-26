import React from 'react';

interface StatusPoint {
  timestamp: string;
  status: 'healthy' | 'down' | 'checking' | 'slow';
  responseTime?: number;
}

interface StatusTimelineProps {
  data: StatusPoint[];
  maxItems?: number;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ 
  data, 
  maxItems = 24 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500 hover:bg-green-600';
      case 'down':
        return 'bg-red-500 hover:bg-red-600';
      case 'checking':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'slow':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'down':
        return '✗';
      case 'checking':
        return '⟳';
      case 'slow':
        return '!';
      default:
        return '?';
    }
  };

  const getStatusTooltip = (point: StatusPoint) => {
    const time = new Date(point.timestamp).toLocaleString();
    const status = point.status.toUpperCase();
    const response = point.responseTime ? ` • ${point.responseTime}ms` : '';
    return `${status}${response} • ${time}`;
  };

  // Take only the most recent items
  const recentData = data.slice(-maxItems);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Status Timeline (Last {maxItems} checks)
      </h4>
      
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {recentData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No status history available
          </p>
        ) : (
          recentData.map((point, index) => (
            <div
              key={`${point.timestamp}-${index}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-all duration-200 transform hover:scale-110 ${getStatusColor(point.status)}`}
              title={getStatusTooltip(point)}
            >
              {getStatusIcon(point.status)}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Healthy</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Down</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Slow</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Checking</span>
        </div>
      </div>
    </div>
  );
};
