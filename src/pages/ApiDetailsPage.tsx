import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { EnhancedChart } from '../components/EnhancedChart';
import { useSimpleAlertSystem } from '../hooks/useSimpleAlertSystem';
import { ApiLogs } from '../components/ApiLogs';
import { StatusTimeline } from '../components/EnhancedStatusTimeline';
import { calculateHealthScore, getHealthScoreColor, getHealthScoreBgColor } from '../utils/healthScore';

interface ApiDetails {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'down' | 'checking' | 'slow';
  avgResponseTime: number;
  uptime: number;
  errorRate: number;
  lastChecked: string;
  healthScore: number;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
}

interface ChartDataPoint {
  time: string;
  responseTime: number;
  errorRate: number;
  status: 'healthy' | 'down' | 'checking' | 'slow';
}

interface LogEntry {
  id: string;
  timestamp: string;
  status: 'success' | 'failure';
  responseTime: number;
  message: string;
  statusCode?: number;
}

interface ApiResponse {
  details: ApiDetails;
  chartData: ChartDataPoint[];
  statusHistory: Array<{
    timestamp: string;
    status: 'healthy' | 'down' | 'checking' | 'slow';
    responseTime: number;
  }>;
  recentLogs: LogEntry[];
}

const ApiDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  // Fetch API details
  const fetchApiDetails = async () => {
    if (!id) return;

    try {
      setError(null);
      
      // Mock API call - replace with real backend call
      const mockData: ApiResponse = {
        details: {
          id: id,
          name: 'User API',
          url: 'https://api.example.com/user/health',
          status: 'healthy',
          avgResponseTime: 145,
          uptime: 99.7,
          errorRate: 0.3,
          lastChecked: new Date().toISOString(),
          healthScore: 92,
          totalRequests: 15420,
          successRequests: 15375,
          failedRequests: 45
        },
        chartData: generateMockChartData(),
        statusHistory: generateMockStatusHistory(),
        recentLogs: generateMockLogs()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData(mockData);
    } catch (err) {
      setError('Failed to fetch API details');
      console.error('Error fetching API details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate mock chart data
  const generateMockChartData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toISOString(),
        responseTime: Math.floor(Math.random() * 200) + 80,
        errorRate: Math.random() * 2,
        status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'slow' : 'down'
      });
    }
    
    return data;
  };

  // Generate mock status history
  const generateMockStatusHistory = () => {
    const history = [];
    const now = new Date();
    
    for (let i = 47; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30 * 60 * 1000); // Every 30 minutes
      history.push({
        timestamp: time.toISOString(),
        status: Math.random() > 0.15 ? 'healthy' : Math.random() > 0.5 ? 'slow' : 'down',
        responseTime: Math.floor(Math.random() * 200) + 80
      });
    }
    
    return history;
  };

  // Generate mock logs
  const generateMockLogs = (): LogEntry[] => {
    const logs: LogEntry[] = [];
    const now = new Date();
    const statuses = ['success', 'failure'] as const;
    const messages = [
      'API responded successfully',
      'Connection timeout',
      'Server error occurred',
      'Request completed',
      'Database connection failed',
      'Authentication successful',
      'Rate limit exceeded',
      'Response processed successfully'
    ];
    
    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000); // Every 5 minutes
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      logs.push({
        id: `log-${i}`,
        timestamp: timestamp.toISOString(),
        status,
        responseTime: Math.floor(Math.random() * 300) + 50,
        message: messages[Math.floor(Math.random() * messages.length)],
        statusCode: status === 'success' ? 200 : Math.floor(Math.random() * 3) + 400
      });
    }
    
    return logs;
  };

  // Initial fetch
  useEffect(() => {
    fetchApiDetails();
  }, [id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApiDetails();
    }, 30000);

    return () => clearInterval(interval);
  }, [id]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchApiDetails();
  };

  // Handle time range change
  const handleTimeRangeChange = (range: '1h' | '24h' | '7d') => {
    setTimeRange(range);
    // In a real app, this would trigger a new API call with the range parameter
    fetchApiDetails();
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading API details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading API Details
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { details, chartData, statusHistory, recentLogs } = data;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {details.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {details.url}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Status */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Current Status
                </p>
                <StatusBadge
                  status={details.status}
                  responseTime={details.avgResponseTime}
                  lastChecked={details.lastChecked}
                />
              </div>
            </div>

            {/* Health Score */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Health Score
              </p>
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-lg font-bold ${getHealthScoreBgColor(details.healthScore)} ${getHealthScoreColor(details.healthScore)}`}>
                {details.healthScore}/100
              </div>
            </div>

            {/* Uptime */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Uptime (24h)
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {details.uptime}%
                </span>
                {details.uptime >= 99 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Avg Response Time */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Avg Response Time
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {details.avgResponseTime}ms
                </span>
                {details.avgResponseTime > 200 && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Request Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {details.totalRequests.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {((details.successRequests / details.totalRequests) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Failed Requests
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {details.failedRequests.toLocaleString()}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Charts and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Response Time Chart */}
          <div className="lg:col-span-2">
            <EnhancedChart
              data={chartData}
              title="Response Time Trend (24h)"
              type="composed"
              showErrorRate={true}
              timeRange={timeRange}
              height={400}
            />
          </div>

          {/* Status Timeline */}
          <div>
            <StatusTimeline
              data={statusHistory}
              maxItems={48}
            />
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Activity Logs
            </h3>
          </div>
          
          <ApiLogs logs={recentLogs} />
        </div>
      </div>
    </div>
  );
};

export default ApiDetailsPage;
