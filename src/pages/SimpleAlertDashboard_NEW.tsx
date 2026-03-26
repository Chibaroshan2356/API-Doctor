import React, { useState } from "react";
import { Activity, CheckCircle, Plus, X, TrendingUp, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ApiData {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "down" | "checking" | "slow";
  avgResponseTime?: number;
  uptime?: number;
  lastChecked?: string;
}

// Generate mock trend data for demonstration
const generateMockTrendData = () => {
  const now = new Date();
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseTime: Math.floor(Math.random() * 200) + 100
    });
  }
  return data;
};

const SimpleAlertDashboard: React.FC = () => {
  const [data, setData] = useState<ApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", url: "" });

  // Load APIs from backend on component mount
  React.useEffect(() => {
    const loadApis = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/apis");
        const apis = response.data.map((api: any) => ({
          id: api.id,
          name: api.name,
          url: api.url,
          status: api.active ? "healthy" : "down",
          avgResponseTime: Math.floor(Math.random() * 200) + 50,
          uptime: Math.floor(Math.random() * 10) + 90,
          lastChecked: new Date().toISOString(),
        }));
        setData(apis);
      } catch (error) {
        console.error("Error loading APIs:", error);
        // Fallback to sample data if backend fails
        setData([
          {
            id: "1",
            name: "User API",
            url: "https://api.example.com/users",
            status: "healthy",
            avgResponseTime: 120,
            uptime: 99.5,
            lastChecked: new Date().toISOString(),
          },
          {
            id: "2", 
            name: "Payment API",
            url: "https://api.example.com/payments",
            status: "down",
            avgResponseTime: 0,
            uptime: 95.2,
            lastChecked: new Date().toISOString(),
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadApis();
  }, []);

  const handleAddApi = async (apiData: { name: string; url: string }) => {
    try {
      console.log("Adding API:", apiData);
      
      if (!apiData.url.startsWith("http://") && !apiData.url.startsWith("https://")) {
        toast.error("❌ URL must start with http:// or https://");
        return;
      }

      const response = await axios.post("/api/apis", {
        ...apiData,
        active: true,
        intervalSeconds: 30,
        method: "GET",
        expectedStatus: 200,
      });

      const newApi = response.data;
      
      setData(prev => [...prev, {
        id: newApi.id,
        name: newApi.name,
        url: newApi.url,
        status: "healthy",
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        uptime: Math.floor(Math.random() * 10) + 90,
        lastChecked: new Date().toISOString(),
      }]);

      toast.success(`✅ ${apiData.name} added successfully!`);
      setShowAddModal(false);
      setFormData({ name: "", url: "" });
      
    } catch (error) {
      console.error("Error adding API:", error);
      toast.error("❌ Failed to add API");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-red-500 text-4xl font-bold">TEST HEADER - IF YOU SEE THIS, FILE IS CORRECT</h1>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl mb-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🌐 API Monitor Dashboard
          </h1>
          <p className="text-sm opacity-90">
            Real-time monitoring of your APIs with automatic incident detection
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500 dark:text-gray-400">Loading APIs...</div>
          </div>
        ) : (
          <>
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total APIs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.length}</p>
              </div>
              <div className="text-2xl"><Activity size={24} /></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Healthy APIs</p>
                <p className="text-2xl font-bold text-green-600">{data.filter(api => api.status === 'healthy').length}</p>
              </div>
              <div className="text-2xl"><CheckCircle size={24} /></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Down APIs</p>
                <p className="text-2xl font-bold text-red-600">{data.filter(api => api.status === 'down').length}</p>
              </div>
              <div className="text-2xl text-red-600"><X size={24} /></div>
            </div>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* API Status Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">API Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Healthy', value: data.filter(api => api.status === 'healthy').length, color: '#10b981' },
                    { name: 'Down', value: data.filter(api => api.status === 'down').length, color: '#ef4444' },
                    { name: 'Checking', value: data.filter(api => api.status === 'checking').length, color: '#f59e0b' },
                    { name: 'Slow', value: data.filter(api => api.status === 'slow').length, color: '#f97316' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {[
                    { name: 'Healthy', value: data.filter(api => api.status === 'healthy').length, color: '#10b981' },
                    { name: 'Down', value: data.filter(api => api.status === 'down').length, color: '#ef4444' },
                    { name: 'Checking', value: data.filter(api => api.status === 'checking').length, color: '#f59e0b' },
                    { name: 'Slow', value: data.filter(api => api.status === 'slow').length, color: '#f97316' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">API Response Times</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.map(api => ({
                name: api.name.length > 15 ? api.name.substring(0, 15) + '...' : api.name,
                responseTime: api.avgResponseTime || 0,
                status: api.status
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responseTime" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Trend Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Response Time Trends (Last 24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateMockTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Add API Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add API
          </button>
        </div>

        {/* Add API Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[400px] shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Add New API</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddApi(formData);
              }} className="space-y-4">
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
                    onClick={() => setShowAddModal(false)}
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
        )}

        {/* APIs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((api) => (
            <div key={api.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-white">{api.name}</h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  api.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  api.status === 'down' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {api.status.toUpperCase()}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>URL:</strong> {api.url}</p>
                <p><strong>Status:</strong> {api.status}</p>
                {api.avgResponseTime && <p><strong>Response Time:</strong> {api.avgResponseTime}ms</p>}
                {api.uptime && <p><strong>Uptime:</strong> {api.uptime}%</p>}
                <p><strong>Last Checked:</strong> {api.lastChecked ? new Date(api.lastChecked).toLocaleString() : 'Never'}</p>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SimpleAlertDashboard;
