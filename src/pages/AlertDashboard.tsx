import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Activity, CheckCircle, XCircle, AlertTriangle, Bell, BellOff } from "lucide-react";
import { StatusCard } from "../components/StatusCard";
import { DashboardTable } from "../components/DashboardTable";
import { useAlertSystem } from "../hooks/useAlertSystem";

interface ApiData {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "down" | "checking" | "slow";
  avgResponseTime?: number;
  uptime?: number;
  trend?: number;
  lastChecked?: string;
}

interface DashboardData {
  totalApis: number;
  healthyApis: number;
  downApis: number;
  apis: ApiData[];
}

const AlertDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertsMuted, setAlertsMuted] = useState(false);

  // Initialize alert system
  const {
    previousStatuses,
    activeAlerts,
    triggerAlert,
    clearAlert,
    clearAllAlerts,
    playAlertSound,
    updateBrowserTitle,
  } = useAlertSystem({
    enableSound: soundEnabled && !alertsMuted,
    enableBrowserTitle: true,
    toastDuration: 5000,
  });

  // Mock data for demonstration
  const mockData: DashboardData = {
    totalApis: 4,
    healthyApis: 2,
    downApis: 2,
    apis: [
      {
        id: "1",
        name: "User API",
        url: "https://api.example.com/user/health",
        status: "healthy",
        avgResponseTime: 120,
        uptime: 99.9,
        trend: 12.5,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "2", 
        name: "Payment API",
        url: "https://api.example.com/payment/health",
        status: "healthy",
        avgResponseTime: 85,
        uptime: 99.5,
        trend: -5.2,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Notification API", 
        url: "https://api.example.com/notification/health",
        status: "down",
        avgResponseTime: 0,
        uptime: 95.2,
        trend: -15.8,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Analytics API",
        url: "https://api.example.com/analytics/health",
        status: "down",
        avgResponseTime: 0,
        uptime: 87.3,
        trend: -8.1,
        lastChecked: new Date().toISOString(),
      },
    ],
  };

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData(mockData);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        setError("Error loading dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Alert system: Monitor API status changes
  useEffect(() => {
    if (!data) return;

    data.apis.forEach(api => {
      const prevStatus = previousStatuses.get(api.id);
      
      // Trigger alert if status changed to down
      if (prevStatus !== api.status) {
        triggerAlert(api, prevStatus);
      }
    });
  }, [data?.apis, previousStatuses, triggerAlert]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!data) return;

      // Randomly change one API status to demonstrate alerts
      const randomApi = data.apis[Math.floor(Math.random() * data.apis.length)];
      const newStatus = Math.random() > 0.7 ? 'down' : 'healthy';
      
      if (randomApi.status !== newStatus) {
        setData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            apis: prev.apis.map(api => 
              api.id === randomApi.id 
                ? { ...api, status: newStatus as any, lastChecked: new Date().toISOString() }
                : api
            ),
            healthyApis: prev.apis.filter(a => a.id === randomApi.id ? newStatus === 'healthy' : a.status === 'healthy').length,
            downApis: prev.apis.filter(a => a.id === randomApi.id ? newStatus === 'down' : a.status === 'down').length,
          };
        });
      }
    }, 15000); // Change every 15 seconds for demo

    return () => clearInterval(interval);
  }, [data]);

  // Manual API check function
  const handleCheckApi = async (apiId: string) => {
    if (!data) return;

    const api = data.apis.find(a => a.id === apiId);
    if (!api) return;

    // Simulate checking API
    const newStatus = Math.random() > 0.3 ? 'healthy' : 'down';
    const responseTime = Math.floor(Math.random() * 200) + 50;

    setData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        apis: prev.apis.map(a => 
          a.id === apiId 
            ? { 
                ...a, 
                status: newStatus as any, 
                avgResponseTime: responseTime,
                lastChecked: new Date().toISOString()
              }
            : a
        ),
        healthyApis: prev.apis.filter(a => a.id === apiId ? newStatus === 'healthy' : a.status === 'healthy').length,
        downApis: prev.apis.filter(a => a.id === apiId ? newStatus === 'down' : a.status === 'down').length,
      };
    });

    toast.success(`✅ ${api.name} checked successfully`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
            Dashboard Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg p-5">
        <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-600" />
          API Doctor
        </h2>
        
        {/* Alert Controls */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Alert Settings
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sound</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1 rounded ${soundEnabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mute All</span>
              <button
                onClick={() => setAlertsMuted(!alertsMuted)}
                className={`p-1 rounded ${!alertsMuted ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              >
                {alertsMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {activeAlerts.size > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-400">
                Active Alerts ({activeAlerts.size})
              </h3>
              <button
                onClick={clearAllAlerts}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2">
              {Array.from(activeAlerts).map(apiId => {
                const api = data?.apis.find(a => a.id === apiId);
                return api ? (
                  <div key={apiId} className="flex items-center justify-between text-xs">
                    <span className="text-red-600 dark:text-red-400">{api.name}</span>
                    <button
                      onClick={() => clearAlert(apiId)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        <ul className="space-y-4">
          <li className="text-gray-500 dark:text-gray-400 px-3 py-2">
            Dashboard
          </li>
          <li className="text-gray-500 dark:text-gray-400 px-3 py-2">
            API Management
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 dark:text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">API Doctor Dashboard</h1>
              <p className="text-blue-100 mt-2">Real-time API monitoring with intelligent alerts</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-100">Last updated</p>
              <p className="text-sm font-mono">{lastUpdated}</p>
              <div className="mt-2 flex items-center justify-end space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Live</span>
                {activeAlerts.size > 0 && (
                  <>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">{activeAlerts.size} Alerts</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatusCard 
            title="Total APIs" 
            value={data?.totalApis || 0} 
            icon={<Activity className="text-blue-400" />}
          />
          <StatusCard 
            title="Healthy" 
            value={data?.healthyApis || 0} 
            icon={<CheckCircle className="text-green-400" />}
          />
          <StatusCard 
            title="Down" 
            value={data?.downApis || 0} 
            icon={<XCircle className="text-red-400" />}
            className={data?.downApis && data.downApis > 0 ? "shadow-red-500/50 animate-pulse" : ""}
          />
        </div>

        {/* API Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              API Status Overview
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    API
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data?.apis.map((api) => (
                  <tr
                    key={api.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      activeAlerts.has(api.id) ? 'bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center">
                          {api.name}
                          {activeAlerts.has(api.id) && (
                            <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {api.url}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        api.status === 'healthy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : api.status === 'down'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : api.status === 'checking'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {api.status === 'healthy' && '🟢 UP'}
                        {api.status === 'down' && '🔴 DOWN'}
                        {api.status === 'checking' && '🔄 CHECKING'}
                        {api.status === 'slow' && '🟡 SLOW'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {api.avgResponseTime || 0}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {api.uptime || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCheckApi(api.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Check Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Demo Section */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4">
            🚨 Alert System Demo
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>• APIs will randomly change status every 15 seconds to demonstrate alerts</p>
            <p>• Only status changes from healthy → down trigger alerts</p>
            <p>• Browser title updates when APIs are down</p>
            <p>• Sound alerts play (if enabled)</p>
            <p>• Active alerts are tracked in the sidebar</p>
            <p>• Recovery notifications show when APIs come back online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDashboard;
