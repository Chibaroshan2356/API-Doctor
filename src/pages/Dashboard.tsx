import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
// import { getDashboard } from "../services/dashboardService";
import StatusCard from "../components/StatusCard";
import DashboardTable from "../components/DashboardTable";
import Chart from "../components/Chart";
import ApiManagement from "../components/ApiManagement";
import { Activity, CheckCircle, XCircle } from "lucide-react";

interface ApiData {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "down" | "checking" | "slow";
  avgResponseTime: number;
  uptime: number;
  trend?: number; // percentage change
  lastChecked?: string;
}

interface DashboardData {
  totalApis: number;
  healthyApis: number;
  downApis: number;
  apis: ApiData[];
}

interface ChartData {
  time: string;
  value: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [shownAlerts, setShownAlerts] = useState<Set<string>>(new Set());
  const hasFetched = useRef(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const controllersRef = useRef<Map<number, AbortController>>(new Map());

  useEffect(() => {
    if (hasFetched.current) return; // 🛑 prevent double run in Strict Mode
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        // For now, use mock data until backend is running
        const mockData = {
          totalApis: 3,
          healthyApis: 2,
          downApis: 1,
          apis: [
            {
              id: "1",
              name: "User API",
              url: "https://api.example.com/user/health",
              status: "healthy" as const,
              avgResponseTime: 120,
              uptime: 99.9,
              trend: 12.5,
            },
            {
              id: "2", 
              name: "Payment API",
              url: "https://api.example.com/payment/health",
              status: "healthy" as const,
              avgResponseTime: 85,
              uptime: 99.5,
              trend: -5.2,
            },
            {
              id: "3",
              name: "Notification API", 
              url: "https://api.example.com/notification/health",
              status: "down" as const,
              avgResponseTime: 0,
              uptime: 95.2,
              trend: -15.8,
            },
          ],
        };
        
        setData(mockData);
        setError(null);
        setLastUpdated(new Date().toLocaleTimeString());
        
        // Alert system for down APIs (prevent spam)
        mockData.apis.forEach(api => {
          if (api.status === 'down') {
            toast.error(`🚨 ${api.name} is DOWN!`);
            setShownAlerts(prev => {
              if (!prev.has(api.name)) {
                return new Set(prev).add(api.name);
              }
              return prev;
            });
          }
        });
        
        // Uncomment this when backend is ready:
        // const response = await getDashboard();
        // setData(response.data);
      } catch (err) {
        setError("Error loading dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Cleanup on unmount
    return () => {
      const controllers = controllersRef.current;
      controllers.forEach(controller => controller.abort());
      controllers.clear();
    };
  }, []);

  // Single API update function to prevent inconsistency
  const updateApi = (updatedApi: ApiData) => {
    setData(prev => prev ? {
      ...prev,
      apis: prev.apis.map(api =>
        api.id === updatedApi.id ? updatedApi : api
      ),
    } : null);
  };

  // API Management handlers
  // Refresh function for API list
  const refreshApis = async () => {
    try {
      const response = await fetch('/api/apis');
      const apis = await response.json();
      
      if (data) {
        const updatedData = {
          ...data,
          apis: apis,
          totalApis: apis.length,
        };
        setData(updatedData);
      }
    } catch (error) {
      console.error('Error refreshing APIs:', error);
      toast.error('❌ Failed to refresh APIs');
    }
  };
  
  const handleDeleteApi = async (id: string) => {
    try {
      // Mock delete since backend isn't running
      if (data) {
        const apiToDelete = data.apis.find(api => api.id === id);
        const updatedData = {
          ...data,
          totalApis: data.totalApis - 1,
          apis: data.apis.filter(api => api.id !== id),
          healthyApis: data.apis.filter(a => a.id !== id && a.status === "healthy").length,
          downApis: data.apis.filter(a => a.id !== id && a.status === "down").length,
        };
        setData(updatedData);
        
        if (apiToDelete) {
          toast.success(`🗑️ ${apiToDelete.name} deleted successfully!`);
        }
      }
    } catch (err) {
      toast.error(`❌ Failed to delete API`);
      console.error("Delete API error:", err);
    }
  };
  
  const handleCheckApi = async (id: string, retries: number = 1) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Cancel existing request
        const existingController = controllersRef.current.get(parseInt(id));
        if (existingController) {
          existingController.abort();
        }
        
        // Create new controller
        const controller = new AbortController();
        controllersRef.current.set(parseInt(id), controller);
        
        setLoadingId(id);
        
        // Show checking status immediately
        updateApi({
          ...data?.apis.find(api => api.id === id),
          status: "checking" as const,
        });
        
        // Mock response since backend doesn't exist yet
        const mockResponse = await new Promise<Response>((resolve) => {
          setTimeout(() => {
            const mockApi = {
              ...data?.apis.find(api => api.id === id),
              status: Math.random() > 0.3 ? 'healthy' as const : 'down' as const,
              avgResponseTime: Math.floor(Math.random() * 200) + 50,
              uptime: Math.floor(Math.random() * 10) + 90,
              lastChecked: new Date().toISOString(),
            };
            resolve(new Response(JSON.stringify(mockApi), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }, 1000 + Math.random() * 1000); // 1-2 second delay
        });
        
        const updatedApi = await mockResponse.json();
        
        // Update with real data
        updateApi(updatedApi);
        
        // Improved error classification
        toast.success(`✅ ${updatedApi.name} checked successfully!`);
        return; // Success, exit retry loop
      } catch (err: unknown) {
        const error = err as Error;
        if (attempt === retries) {
          // Final attempt failed, update to down
          const originalApi = data?.apis.find(api => api.id === id);
          if (originalApi) {
            updateApi({
              ...originalApi,
              status: "down" as const,
            });
          }
          toast.error(`❌ ${data?.apis.find(a => a.id === id)?.name || 'API'} failed after ${retries} attempts`);
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }
  };

  useEffect(() => {
    if (selectedApi) {
      // Static mock chart data for selected API (prevents infinite loop)
      const staticChartData = [
        { time: "00:00", value: 120 },
        { time: "04:00", value: 132 },
        { time: "08:00", value: 101 },
        { time: "12:00", value: 134 },
        { time: "16:00", value: 90 },
        { time: "20:00", value: 230 },
      ];
      setChartData(staticChartData);
    }
  }, [selectedApi]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ALWAYS VISIBLE DEBUG */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        zIndex: 999999,
        textAlign: 'center'
      }}>
        DASHBOARD LOADED - If you see this, Dashboard is rendering
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg p-5 transition-colors">
        <h2 className="text-xl font-bold mb-6 dark:text-white">API Doctor</h2>
        <ul className="space-y-4">
          <li 
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Dashboard
          </li>
          <li 
            onClick={() => setActiveTab('management')}
            className={`cursor-pointer px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'management' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            API Management
          </li>
          <li className="text-gray-500 dark:text-gray-400">Settings</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 dark:text-white">
        {/* Tab Content */}
        {activeTab === 'dashboard' ? (
          <>
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl mb-6 text-white">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🌐 API Monitor Dashboard
              </h1>
              <p className="text-sm opacity-90">
                Real-time monitoring of your APIs with automatic incident detection
              </p>
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

        {/* Chart Section */}
        {selectedApi && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white">
                {data?.apis.find(api => api.id === selectedApi)?.name} Performance
              </h3>
              <button
                onClick={() => setSelectedApi(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </div>
            <Chart 
              data={chartData} 
              type="line" 
              title="Response Time Trend" 
              color="#3b82f6"
            />
          </div>
        )}

        {/* API Table */}
        <DashboardTable 
          data={data?.apis || []} 
          onApiClick={setSelectedApi}
          selectedApi={selectedApi}
        />
          </>
        ) : (
          <>
            <div style={{backgroundColor: 'red', color: 'white', padding: '10px', margin: '10px'}}>
              DEBUG: ApiManagement component should render below
            </div>
            <ApiManagement
              apis={data?.apis || []}
              onDeleteApi={handleDeleteApi}
              onCheckApi={handleCheckApi}
              loadingId={loadingId}
              refreshApis={refreshApis}
            />
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
