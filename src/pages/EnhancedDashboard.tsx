import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Activity, CheckCircle, XCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { StatusCard } from "../components/StatusCard";
import { DashboardTable } from "../components/DashboardTable";
import { EnhancedChart } from "../components/EnhancedChart";
import { EnhancedApiManagement } from "../components/EnhancedApiManagement";
import { StatusTimeline } from "../components/StatusTimeline";
import { useEnhancedApiMonitor } from "../hooks/useEnhancedApiMonitor";
import { useRealTimePolling } from "../hooks/useRealTimePolling";
import { calculateHealthScore, getHealthScoreColor, getHealthScoreBgColor } from "../utils/healthScore";

interface ApiData {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "down" | "checking" | "slow";
  avgResponseTime?: number;
  uptime?: number;
  errorRate?: number;
  trend?: number;
  lastChecked?: string;
  healthScore?: number;
}

interface DashboardData {
  totalApis: number;
  healthyApis: number;
  downApis: number;
  slowApis: number;
  avgResponseTime: number;
  systemUptime: number;
  apis: ApiData[];
}

interface ChartData {
  time: string;
  responseTime: number;
  errorRate?: number;
  status?: string;
}

const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management'>('dashboard');
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Use the enhanced API monitor hook
  const {
    apis,
    loadingId,
    loadingIds,
    handleCheckApi,
    handleDeleteApi,
    handleAddApi,
    handleBulkCheck,
    handleBulkDelete,
  } = useEnhancedApiMonitor();

  // Real-time polling for dashboard data
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useRealTimePolling<DashboardData>(
    async () => {
      // Mock dashboard data calculation
      const healthyCount = apis.filter(api => api.status === 'healthy').length;
      const downCount = apis.filter(api => api.status === 'down').length;
      const slowCount = apis.filter(api => api.status === 'slow').length;
      
      const avgResponseTime = apis.length > 0 
        ? Math.round(apis.reduce((sum, api) => sum + (api.avgResponseTime || 0), 0) / apis.length)
        : 0;
      
      const systemUptime = apis.length > 0
        ? Math.round(apis.reduce((sum, api) => sum + (api.uptime || 0), 0) / apis.length)
        : 0;

      return {
        totalApis: apis.length,
        healthyApis: healthyCount,
        downApis: downCount,
        slowApis: slowCount,
        avgResponseTime,
        systemUptime,
        apis: apis.map(api => ({
          ...api,
          healthScore: calculateHealthScore(api).score
        }))
      };
    },
    {
      interval: 10000, // 10 seconds
      enabled: activeTab === 'dashboard',
      onSuccess: () => setLastUpdated(new Date().toLocaleTimeString())
    }
  );

  // Generate chart data for selected API
  useEffect(() => {
    if (selectedApi && apis.length > 0) {
      const api = apis.find(a => a.id === selectedApi);
      if (api) {
        // Mock chart data generation
        const mockChartData: ChartData[] = [];
        const now = new Date();
        
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000);
          mockChartData.push({
            time: time.toISOString(),
            responseTime: Math.floor(Math.random() * 200) + 50 + (api.avgResponseTime || 0),
            errorRate: Math.random() * 5,
            status: Math.random() > 0.3 ? 'healthy' : 'down'
          });
        }
        
        setChartData(mockChartData);
      }
    } else {
      setChartData([]);
    }
  }, [selectedApi, apis]);

  // Handle API selection for detailed view
  const handleApiClick = (apiId: string) => {
    setSelectedApi(apiId === selectedApi ? null : apiId);
  };

  // Clear selected API when switching tabs
  useEffect(() => {
    if (activeTab !== 'dashboard') {
      setSelectedApi(null);
    }
  }, [activeTab]);

  if (dashboardLoading && !dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Failed to load dashboard data
          </p>
          <button
            onClick={refetchDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg p-5 transition-colors">
        <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-600" />
          API Doctor
        </h2>
        
        <ul className="space-y-4">
          <li 
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </div>
          </li>
          <li 
            onClick={() => setActiveTab('management')}
            className={`cursor-pointer px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'management' 
                ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              API Management
            </div>
          </li>
          <li className="text-gray-500 dark:text-gray-400 px-3 py-2">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Settings (Coming Soon)
            </div>
          </li>
        </ul>

        {/* System Info */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            System Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span className="text-gray-900 dark:text-white font-mono">{lastUpdated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Polling:</span>
              <span className="text-green-600 dark:text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">APIs Monitored:</span>
              <span className="text-gray-900 dark:text-white">{dashboardData?.totalApis || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 dark:text-white">
        {activeTab === 'dashboard' ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl mb-6 shadow-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">API Doctor Dashboard</h1>
                  <p className="text-blue-100 mt-2">Real-time API monitoring and analytics</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-100">Last updated</p>
                  <p className="text-sm font-mono">{lastUpdated}</p>
                  <div className="mt-2 flex items-center justify-end space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <StatusCard 
                title="Total APIs" 
                value={dashboardData?.totalApis || 0} 
                icon={<Activity className="text-blue-400" />}
                trend={null}
              />
              <StatusCard 
                title="Healthy" 
                value={dashboardData?.healthyApis || 0} 
                icon={<CheckCircle className="text-green-400" />}
                trend={dashboardData?.healthyApis && dashboardData.totalApis > 0 ? 
                  ((dashboardData.healthyApis / dashboardData.totalApis) * 100) : null}
              />
              <StatusCard 
                title="Down" 
                value={dashboardData?.downApis || 0} 
                icon={<XCircle className="text-red-400" />}
                className={dashboardData?.downApis && dashboardData.downApis > 0 ? 
                  "shadow-red-500/50 animate-pulse" : ""}
              />
              <StatusCard 
                title="Slow" 
                value={dashboardData?.slowApis || 0} 
                icon={<AlertTriangle className="text-yellow-400" />}
              />
              <StatusCard 
                title="Avg Response" 
                value={`${dashboardData?.avgResponseTime || 0}ms`} 
                icon={<Clock className="text-purple-400" />}
                trend={null}
              />
            </div>

            {/* Selected API Details */}
            {selectedApi && dashboardData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <EnhancedChart
                    data={chartData}
                    title={`${dashboardData.apis.find(a => a.id === selectedApi)?.name} Performance`}
                    type="composed"
                    showErrorRate={true}
                    timeRange={timeRange}
                  />
                </div>
                <div>
                  <StatusTimeline
                    data={chartData.map(d => ({
                      timestamp: d.time,
                      status: d.status as any,
                      responseTime: d.responseTime
                    }))}
                    maxItems={12}
                  />
                </div>
              </div>
            )}

            {/* API Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    API Overview
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as any)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="1h">Last 1 hour</option>
                      <option value="24h">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                    </select>
                    <button
                      onClick={() => refetchDashboard()}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Refresh"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <DashboardTable 
                data={dashboardData?.apis || []} 
                onApiClick={handleApiClick}
                selectedApi={selectedApi}
                loadingIds={loadingIds}
              />
            </div>
          </>
        ) : (
          <EnhancedApiManagement
            apis={apis}
            onAddApi={handleAddApi}
            onDeleteApi={handleDeleteApi}
            onCheckApi={handleCheckApi}
            onBulkCheck={handleBulkCheck}
            onBulkDelete={handleBulkDelete}
            loadingId={loadingId}
            loadingIds={loadingIds}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;
