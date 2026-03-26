import React from 'react';

interface StatusBadgeProps {
  status: 'healthy' | 'down' | 'checking' | 'slow';
  responseTime?: number;
  lastChecked?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  responseTime, 
  lastChecked 
}) => {
  const getColorClasses = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'down':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'checking':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'slow':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return responseTime ? `🟢 UP • ${responseTime}ms` : '🟢 UP • Responsive';
      case 'down':
        return '🔴 DOWN • No response';
      case 'checking':
        return '🔄 CHECKING';
      case 'slow':
        return responseTime ? `🟡 SLOW • ${responseTime}ms` : '🟡 SLOW • High latency';
      default:
        return '⚪ UNKNOWN';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        );
      case 'down':
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        );
      case 'checking':
        return (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin" />
        );
      case 'slow':
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        );
      default:
        return (
          <div className="w-2 h-2 bg-gray-500 rounded-full" />
        );
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClasses()}`}>
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>
      </span>
      {lastChecked && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(lastChecked).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
