import React, { useState, useMemo, useEffect, useRef } from "react";
import { Activity, CheckCircle, Plus, X, ArrowUpDown, Filter, Search, RefreshCw, Clock, TrendingUp, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { updateApi, deleteApi, createApi } from "../services/apiService";
import DashboardLayout from "../components/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import MetricCard from "../components/ui/MetricCard";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonDashboard } from "../components/ui/Skeleton";
import { useApiMonitor } from "../hooks/useApiMonitor";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ApiData {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "down" | "checking" | "slow";
  avgResponseTime?: number;
  uptime?: number;
  lastChecked?: string;
  trend?: number;
  active?: boolean;
}

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiData | null>(null);
  const [formData, setFormData] = useState({ name: "", url: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<{ field: string; order: "asc" | "desc" }>({ field: "name", order: "asc" });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use the same hook as Monitor APIs page
  const { apis, apiStatuses, loading, error, refresh } = useApiMonitor();

  // Convert API configs and statuses to dashboard format
  const displayApis: ApiData[] = useMemo(() => {
    return apis.map((api: any, index: number) => {
      const status = apiStatuses.find((s: any) => s.id === api.id);
      return {
        id: api.id.toString(),
        name: api.name,
        url: api.url,
        status: status ? (status.status as ApiData['status']) : 'checking',
        avgResponseTime: status?.responseTime || 0,
        uptime: 99.5,
        lastChecked: new Date().toISOString(),
        trend: (index % 20) - 10,
      };
    });
  }, [apis, apiStatuses]);

  const filteredApis = useMemo(() => {
    let filtered = [...displayApis];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((api: ApiData) => api.name.toLowerCase().includes(query) || api.url.toLowerCase().includes(query));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((api: ApiData) => api.status === statusFilter);
    }
    filtered.sort((a: ApiData, b: ApiData) => {
      const aValue = a[sortBy.field as keyof ApiData];
      const bValue = b[sortBy.field as keyof ApiData];
      let aCompare: string | number = typeof aValue === 'string' ? aValue.toLowerCase() : (aValue as number) || 0;
      let bCompare: string | number = typeof bValue === 'string' ? bValue.toLowerCase() : (bValue as number) || 0;
      return sortBy.order === "asc" ? (aCompare > bCompare ? 1 : -1) : (aCompare < bCompare ? 1 : -1);
    });
    return filtered;
  }, [displayApis, searchQuery, statusFilter, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = displayApis.length;
    const healthy = displayApis.filter((api: ApiData) => api.status === 'healthy').length;
    const down = displayApis.filter((api: ApiData) => api.status === 'down').length;
    const slow = displayApis.filter((api: ApiData) => api.status === 'slow').length;
    const avgResponseTime = total > 0 ? displayApis.reduce((sum: number, api: ApiData) => sum + (api.avgResponseTime || 0), 0) / total : 0;
    const uptime = total > 0 ? displayApis.reduce((sum: number, api: ApiData) => sum + (api.uptime || 0), 0) / total : 0;
    return { total, healthy, down, slow, avgResponseTime, uptime };
  }, [displayApis]);

  const lastUpdated = new Date();

  const handleEdit = (api: ApiData) => {
    setEditingApi(api);
    setFormData({ name: api.name, url: api.url });
    setMenuOpen(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingApi) return;
    if (!formData.url.startsWith("http://") && !formData.url.startsWith("https://")) {
      toast.error("❌ URL must start with http:// or https://");
      return;
    }
    try {
      const success = await updateApi(Number(editingApi.id), {
        name: formData.name,
        url: formData.url,
        active: true
      });
      if (success) {
        toast.success(`✅ ${formData.name} updated successfully!`);
        setShowEditModal(false);
        setEditingApi(null);
        setFormData({ name: "", url: "" });
        refresh();
      } else {
        toast.error("❌ Failed to update API");
      }
    } catch (err) {
      toast.error("❌ Failed to update API");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this API?")) return;
    try {
      const success = await deleteApi(Number(id));
      if (success) {
        toast.success("🗑️ API deleted successfully");
        setMenuOpen(null);
        refresh();
      } else {
        toast.error("❌ Failed to delete API");
      }
    } catch (err) {
      toast.error("❌ Failed to delete API");
    }
  };

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleAddApi = async (apiData: { name: string; url: string }) => {
    if (!apiData.url.startsWith("http://") && !apiData.url.startsWith("https://")) {
      toast.error("❌ URL must start with http:// or https://");
      return;
    }
    try {
      await createApi({
        name: apiData.name,
        url: apiData.url,
        method: "GET",
        expectedStatus: 200,
        active: true
      });
      toast.success(`✅ ${apiData.name} added successfully!`);
      setShowAddModal(false);
      setFormData({ name: "", url: "" });
      refresh();
    } catch (err) {
      toast.error("❌ Failed to add API");
    }
  };

  const generateSparklineData = (baseValue: number) => Array.from({ length: 10 }, () => baseValue + Math.random() * 40 - 20);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy': return { variant: 'success', label: 'Healthy', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', dotColor: 'bg-emerald-400', dot: true, pulse: false };
      case 'down': return { variant: 'danger', label: 'Down', color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-400', dot: true, pulse: true };
      case 'slow': return { variant: 'warning', label: 'Slow', color: 'text-amber-400', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-400', dot: true, pulse: false };
      default: return { variant: 'neutral', label: 'Unknown', color: 'text-gray-400', bgColor: 'bg-gray-500/10', dotColor: 'bg-gray-400', dot: false, pulse: false };
    }
  };

  if (loading && !apis) {
    return (
      <DashboardLayout title="📊 Dashboard" subtitle="Real-time monitoring of your APIs">
        <SkeletonDashboard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="📊 Dashboard" subtitle="Real-time monitoring of your APIs with automatic incident detection">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900/60 px-3 py-1.5 rounded-full border border-gray-700">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 font-medium">● Live</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={refresh} loading={loading} icon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>Add API</Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <MetricCard title="📡 Total APIs" value={stats.total} subtitle="All monitored endpoints" icon={<Activity className="w-6 h-6" />} variant="default" trend={{ value: 12, label: 'vs last month', positive: true }} miniChart={generateSparklineData(stats.total * 10)} />
        <MetricCard title="✅ Healthy" value={stats.healthy} subtitle="Operating normally" icon={<CheckCircle className="w-6 h-6" />} variant="success" trend={{ value: 5, label: 'vs yesterday', positive: true }} miniChart={generateSparklineData(stats.healthy * 20)} />
        <MetricCard title="❌ Down" value={stats.down} subtitle="Require attention" icon={<X className="w-6 h-6" />} variant="danger" trend={{ value: stats.down > 0 ? -20 : 0, label: 'vs last hour', positive: stats.down === 0 }} miniChart={generateSparklineData(stats.down * 30)} />
        <MetricCard title="⚡ Avg Response" value={`${Math.round(stats.avgResponseTime)}ms`} subtitle="Across all APIs" icon={<TrendingUp className="w-6 h-6" />} variant={stats.avgResponseTime > 200 ? 'warning' : 'default'} trend={{ value: -8, label: 'faster than avg', positive: true }} miniChart={generateSparklineData(stats.avgResponseTime)} />
      </div>

      {/* Filters */}
      <Card variant="glass" className="mb-5 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search APIs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-64 transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:ring-2 focus:ring-blue-500/50">
                <option value="all">All Status</option>
                <option value="healthy">Healthy</option>
                <option value="slow">Slow</option>
                <option value="down">Down</option>
              </select>
            </div>
          </div>
          <span className="text-sm text-gray-500">{filteredApis.length} APIs found</span>
        </div>
      </Card>

      {/* Charts */}
      <div className="mb-4">
        <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wide font-medium">Performance Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">API Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={[{ name: 'Healthy', value: stats.healthy, color: '#10b981' }, { name: 'Down', value: stats.down, color: '#ef4444' }, { name: 'Slow', value: stats.slow, color: '#f59e0b' }].filter(item => item.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                  {[{ name: 'Healthy', value: stats.healthy, color: '#10b981' }, { name: 'Down', value: stats.down, color: '#ef4444' }, { name: 'Slow', value: stats.slow, color: '#f59e0b' }].filter(item => item.value > 0).map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Response Time Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={generateMockTrendData()}>
                <defs><linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="time" stroke="#9ca3af" fontSize={12} /><YAxis stroke="#9ca3af" fontSize={12} unit="ms" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="responseTime" stroke="#3b82f6" fillOpacity={1} fill="url(#colorResponse)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      </div>

      {/* API List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm text-gray-400 mb-1 uppercase tracking-wide font-medium">API Endpoints</h2>
            <h3 className="text-xl font-semibold text-white">Monitored Services</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select value={sortBy.field} onChange={(e) => setSortBy(prev => ({ ...prev, field: e.target.value }))} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <option value="name">Name</option><option value="status">Status</option><option value="responseTime">Response Time</option><option value="uptime">Uptime</option>
            </select>
            <button onClick={() => setSortBy(prev => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowUpDown className={`w-4 h-4 ${sortBy.order === 'desc' ? 'rotate-180' : ''} transition-transform`} />
            </button>
          </div>
        </div>

        {filteredApis.length === 0 ? (
          <EmptyState type="no-results" action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setStatusFilter('all'); } }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredApis.map((api, index) => {
                const statusConfig = getStatusConfig(api.status);
                return (
                  <motion.div key={api.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }}>
                    <Card variant={api.status === 'down' ? 'gradient' : 'glass'} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:shadow-xl hover:shadow-black/60 hover:scale-[1.02] hover:border-gray-700 transition-all duration-300">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <div>
                              <h4 className="font-semibold text-white">{api.name}</h4>
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">{api.url}</p>
                            </div>
                          </div>
                          <div className={`${statusConfig.bgColor || 'bg-gray-500/10'} ${statusConfig.color} px-3 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium`}>
                            <span className={`w-2 h-2 ${statusConfig.dotColor || 'bg-gray-400'} rounded-full`} />
                            {statusConfig.label}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-800/50 rounded-xl p-3 hover:bg-gray-800/70 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <p className="text-xs text-gray-500">Response Time</p>
                            </div>
                            <p className={`text-lg font-semibold ${api.avgResponseTime && api.avgResponseTime > 300 ? 'text-amber-400' : 'text-green-400'}`}>{api.avgResponseTime || 0}ms</p>
                            <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                              <div className={`h-1 ${api.avgResponseTime && api.avgResponseTime > 300 ? 'bg-amber-400' : 'bg-green-400'} rounded-full transition-all duration-500`} style={{ width: `${Math.min(((api.avgResponseTime || 0) / 500) * 100, 100)}%` }} />
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-xl p-3 hover:bg-gray-800/70 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Activity className="w-3 h-3 text-gray-500" />
                              <p className="text-xs text-gray-500">Uptime</p>
                            </div>
                            <p className={`text-lg font-semibold ${api.uptime && api.uptime < 99 ? 'text-amber-400' : 'text-emerald-400'}`}>{api.uptime?.toFixed(1) || 0}%</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${api.status === 'healthy' ? 'bg-emerald-500' : api.status === 'down' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                            <span className="text-sm text-gray-400">{api.status === 'healthy' ? 'Operating normally' : api.status === 'down' ? 'Service unavailable' : 'Degraded performance'}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${api.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                            {api.active ? '● Active' : '○ Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
                          <button className="flex-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center justify-center gap-1 transition-all py-2 rounded-lg">
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(api.id)}
                            className="flex-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center gap-1 transition-all py-2 rounded-lg"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add API Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Add New API</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleAddApi(formData); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Name</label>
                  <input type="text" placeholder="e.g., User API" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API URL</label>
                  <input type="url" placeholder="https://api.example.com/health" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" onClick={(e) => { if (e) e.preventDefault(); handleAddApi(formData); }}>Add API</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit API Modal */}
      <AnimatePresence>
        {showEditModal && editingApi && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Edit API</h2>
                <button onClick={() => { setShowEditModal(false); setEditingApi(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Name</label>
                  <input type="text" placeholder="e.g., User API" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API URL</label>
                  <input type="url" placeholder="https://api.example.com/health" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => { setShowEditModal(false); setEditingApi(null); }}>Cancel</Button>
                  <Button variant="primary" type="submit">Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SimpleAlertDashboard;
