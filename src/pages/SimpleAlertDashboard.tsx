import React, { useState, useEffect } from "react";
import { Activity, CheckCircle, XCircle, AlertTriangle, Bell, BellOff, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSimpleAlertSystem } from "../hooks/useSimpleAlertSystemNew";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";

interface ApiData {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "down" | "checking" | "slow";
  avgResponseTime?: number;
  uptime?: number;
  lastChecked?: string;
}

// Simple Status Card Component
const StatusCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  className?: string;
}> = ({ title, value, icon, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

// Add API Modal Component
const AddApiModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; url: string }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ name: "", url: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.url.trim()) {
      onSubmit(formData);
      setFormData({ name: "", url: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[400px] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Add New API</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Name
            </label>
            <input
              type="text"
              placeholder="e.g., User API"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API URL
            </label>
            <input
              type="url"
              placeholder="https://api.example.com/health"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SimpleAlertDashboard: React.FC = () => {
  const [data, setData] = useState<ApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertsMuted, setAlertsMuted] = useState(false);
  const [soundStatus, setSoundStatus] = useState<string>('Unknown');
  const [showAddModal, setShowAddModal] = useState(false);

  // Handle Add API
  const handleAddApi = async (apiData: { name: string; url: string }) => {
    try {
      console.log("Adding API:", apiData);
      
      // Validate URL
      if (!apiData.url.startsWith("http://") && !apiData.url.startsWith("https://")) {
        toast.error("❌ URL must start with http:// or https://");
        return;
      }

      // Call backend API
      const response = await axios.post("/api/apis", {
        ...apiData,
        active: true,
        intervalSeconds: 30,
        method: "GET",
        expectedStatus: 200,
      });

      const newApi = response.data;
      
      // Add to local state
      setData(prev => [...prev, {
        id: newApi.id,
        name: newApi.name,
        url: newApi.url,
        status: 'healthy' as const,
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        uptime: Math.floor(Math.random() * 10) + 90,
        lastChecked: new Date().toISOString(),
      }]);

      toast.success(`✅ ${apiData.name} added successfully!`);
      setShowAddModal(false);
      
    } catch (error) {
      console.error("Error adding API:", error);
      toast.error("❌ Failed to add API");
    }
  };
      
      const playPromise = testAudio.play();
      if (playPromise !== undefined) {
        await playPromise;
        setSoundStatus(`✅ ${type} sound played successfully!`);
        setTimeout(() => setSoundStatus('Ready'), 3000);
      } else {
        setSoundStatus(`✅ ${type} sound played (legacy browser)!`);
        setTimeout(() => setSoundStatus('Ready'), 3000);
      }
    } catch (error) {
      console.error('❌ Sound test failed:', error);
      setSoundStatus(`❌ Sound test failed: ${error}`);
      setTimeout(() => setSoundStatus('Ready'), 5000);
    }
  };

  // Initialize alert system
  const {
    previousStatuses,
    activeAlerts,
    triggerAlert,
    clearAlert,
    clearAllAlerts,
    playAlertSound,
    playSystemBeep,
  } = useSimpleAlertSystem({
    enableSound: soundEnabled && !alertsMuted,
    enableBrowserTitle: true,
    toastDuration: 5000,
  });

  // Comprehensive sound test function
  const testSoundComprehensive = async () => {
    console.log('🔊 Starting comprehensive sound test...');
    
    try {
      // Test 1: Direct Web Audio API
      console.log('📢 Test 1: Direct Web Audio API');
      await playSystemBeep();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test 2: Alert system sounds
      console.log('📢 Test 2: Alert system sounds');
      playAlertSound('down');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      playAlertSound('recovery');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      playAlertSound('warning');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Test 3: Simple audio element
      console.log('📢 Test 3: Simple audio element');
      const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      testAudio.volume = 1.0;
      testAudio.play().catch(e => console.error('Audio element failed:', e));
      
      console.log('✅ Comprehensive sound test completed!');
      toast.success('🔊 Sound test completed! Check console for details.');
      
    } catch (error) {
      console.error('❌ Sound test failed:', error);
      toast.error('❌ Sound test failed. Check browser permissions.');
    }
  };

  // Mock initial data
  const initialData: ApiData[] = [
    {
      id: "1",
      name: "User API",
      url: "https://api.example.com/user/health",
      status: "healthy",
      avgResponseTime: 120,
      uptime: 99.9,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "2", 
      name: "Payment API",
      url: "https://api.example.com/payment/health",
      status: "healthy",
      avgResponseTime: 85,
      uptime: 99.5,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Notification API", 
      url: "https://api.example.com/notification/health",
      status: "healthy",
      avgResponseTime: 200,
      uptime: 95.2,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Analytics API",
      url: "https://api.example.com/analytics/health",
      status: "healthy",
      avgResponseTime: 150,
      uptime: 87.3,
      lastChecked: new Date().toISOString(),
    },
  ];

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData(initialData);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Alert system: Monitor API status changes
  useEffect(() => {
    data.forEach(api => {
      const prevStatus = previousStatuses.get(api.id);
      
      // Trigger alert if status changed to down
      if (prevStatus !== api.status) {
        triggerAlert(api, prevStatus);
      }
    });
  }, [data, previousStatuses, triggerAlert]);

  // Simulate real-time updates for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (data.length === 0) return;

      // Randomly change one API status to demonstrate alerts
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomApi = data[randomIndex];
      const newStatus = Math.random() > 0.7 ? 'down' : 'healthy';
      
      if (randomApi.status !== newStatus) {
        setData(prev => prev.map(api => 
          api.id === randomApi.id 
            ? { 
                ...api, 
                status: newStatus as any, 
                lastChecked: new Date().toISOString()
              }
            : api
        ));
      }
    }, 15000); // Change every 15 seconds for demo

    return () => clearInterval(interval);
  }, [data]);

  // Manual API check function
  const handleCheckApi = async (apiId: string) => {
    const api = data.find(a => a.id === apiId);
    if (!api) return;

    // Simulate checking API
    const newStatus = Math.random() > 0.3 ? 'healthy' : 'down';
    const responseTime = Math.floor(Math.random() * 200) + 50;

    setData(prev => prev.map(a => 
      a.id === apiId 
        ? { 
            ...a, 
            status: newStatus as any, 
            avgResponseTime: responseTime,
            lastChecked: new Date().toISOString()
          }
        : a
    ));

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

  const healthyCount = data.filter(api => api.status === 'healthy').length;
  const downCount = data.filter(api => api.status === 'down').length;

  return (
    <DashboardLayout 
      title="API Doctor Dashboard"
      subtitle="Real-time API monitoring with intelligent alerts"
    >
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard
          title="Total APIs"
          value={data.length}
          icon={<Activity className="w-8 h-8 text-blue-600" />}
        />
        <StatusCard
          title="Healthy APIs"
          value={healthyCount}
          icon={<CheckCircle className="w-8 h-8 text-green-600" />}
          className="border-green-200 dark:border-green-800"
        />
        <StatusCard
          title="Down APIs"
          value={downCount}
          icon={<XCircle className="w-8 h-8 text-red-600" />}
          className="border-red-200 dark:border-red-800"
        />
        <StatusCard
          title="Active Alerts"
          value={activeAlerts.size}
          icon={<AlertTriangle className="w-8 h-8 text-yellow-600" />}
          className="border-yellow-200 dark:border-yellow-800"
        />
      </div>

      {/* Alert Controls */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alert Controls
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound:</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                soundEnabled 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              {soundEnabled ? '🔊 On' : '🔇 Off'}
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mute All:</span>
            <button
              onClick={() => setAlertsMuted(!alertsMuted)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                !alertsMuted 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {alertsMuted ? '🔇 Muted' : '🔔 Active'}
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Status:</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{soundStatus}</span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.size > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
              🚨 Active Alerts ({activeAlerts.size})
            </h3>
            <button
              onClick={clearAllAlerts}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2">
            {Array.from(activeAlerts).map((apiId) => {
              const api = data.find(a => a.id === apiId);
              if (!api) return null;
              
              return (
                <div key={apiId} className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
                  <div>
                    <span className="font-medium text-red-800 dark:text-red-300">{api.name}</span>
                    <span className="ml-2 text-sm text-red-600 dark:text-red-400">
                      ({api.status.toUpperCase()})
                    </span>
                  </div>
                  <button
                    onClick={() => clearAlert(apiId)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* API Status Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Status Overview
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  API Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((api) => (
                <tr
                  key={api.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    activeAlerts.has(api.id) ? 'bg-red-50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {api.avgResponseTime || 0}ms
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {api.uptime || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Documentation */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Dashboard Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              🚨 Real-time Alerts
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              • Automatic API status monitoring<br/>
              • Sound notifications for failures<br/>
              • Visual alerts in sidebar<br/>
              • Browser title updates when APIs are down<br/>
              • 🔊 Different sounds for different alert types:<br/>
              &nbsp;&nbsp;- Critical alerts: Immediate loud alert<br/>
              &nbsp;&nbsp;- Recovery: Softer, delayed sound<br/>
              &nbsp;&nbsp;- Warnings: Double-beep sound<br/>
              • Active alerts are tracked in the sidebar<br/>
              • Recovery notifications show when APIs come back online<br/>
              • Use test buttons to experience different sound types<br/>
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                💡 If you can't hear sound, check browser audio permissions and volume
              </span>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              📊 Monitoring Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              • Real-time API status tracking<br/>
              • Response time monitoring<br/>
              • Uptime calculations<br/>
              • Status indicators with emojis<br/>
              • Hover effects for better UX<br/>
              • Responsive design for all devices<br/>
              • Dark/Light theme support<br/>
              • Smooth transitions and animations
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          {/* ADD API BUTTON */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add API
          </button>
          
          {/* ADD API MODAL */}
          <AddApiModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddApi}
          />
          
          <button
            onClick={() => {
              // Simulate an API going down
              setData(prev => prev.map(api => 
                api.id === "1" 
                  ? { ...api, status: 'down' as const, lastChecked: new Date().toISOString() }
                  : api
              ));
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
          >
            Simulate API Down
          </button>
          
          <button
            onClick={() => {
              // Simulate recovery
              setData(prev => prev.map(api => 
                api.id === "1" 
                  ? { ...api, status: 'healthy' as const, lastChecked: new Date().toISOString() }
                  : api
              ));
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
          >
            Simulate Recovery
          </button>
          
          <button
            onClick={() => testSoundComprehensive()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200"
          >
            🔊 COMPREHENSIVE SOUND TEST
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SimpleAlertDashboard;
