import React from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  status: 'success' | 'failure';
  responseTime: number;
  message: string;
  statusCode?: number;
}

interface ApiLogsProps {
  logs: LogEntry[];
  maxItems?: number;
}

export const ApiLogs: React.FC<ApiLogsProps> = ({ logs, maxItems = 50 }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'failure':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'failure':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time > 500) return 'text-red-600 dark:text-red-400';
    if (time > 200) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const displayedLogs = logs.slice(0, maxItems);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Response Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Message
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Code
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayedLogs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No logs available</p>
                </div>
              </td>
            </tr>
          ) : (
            displayedLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getStatusIcon(log.status)}</span>
                    <span className={`text-sm font-medium capitalize ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono font-medium ${getResponseTimeColor(log.responseTime)}`}>
                    {log.responseTime}ms
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {log.message}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {log.statusCode ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log.statusCode >= 200 && log.statusCode < 300
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : log.statusCode >= 300 && log.statusCode < 400
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {log.statusCode}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {logs.length > maxItems && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Showing {maxItems} of {logs.length} logs
          </p>
        </div>
      )}
    </div>
  );
};
