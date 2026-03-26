import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, XCircle, Clock, Plus, RefreshCw, Search, Filter, ExternalLink, Globe, X, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiMonitor } from '../hooks/useApiMonitor';
import { updateApi, createApi, checkApi } from '../services/apiService';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';

const ApiMonitorDashboard: React.FC = () => {
  const { apis, apiStatuses, loading, error, refresh } = useApiMonitor();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApi, setEditingApi] = useState<{id: number; name: string; url: string} | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });
  
  // Live tracking state
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [prevStatuses, setPrevStatuses] = useState<{[key: number]: string}>({});
  const [lastChecked, setLastChecked] = useState<{[key: number]: Date}>({});
  const [statusChangeFlash, setStatusChangeFlash] = useState<{[key: number]: boolean}>({});
  
  // Previous status tracking for change detection
  const prevStatusRef = useRef<{[key: number]: string}>({});
  
  // Smart refresh - only when tab is visible
  useEffect(() => {
    if (!autoRefresh || !isLiveTracking) return;
    
    const interval = setInterval(() => {
      // Only refresh if tab is active
      if (document.visibilityState === 'visible') {
        refresh();
        setLastUpdate(new Date());
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, isLiveTracking, refreshInterval, refresh]);
  
  // Status change detection and notifications
  useEffect(() => {
    apiStatuses.forEach(status => {
      const prevStatus = prevStatusRef.current[status.id];
      const currentStatus = status.status;
      
      // Detect status changes
      if (prevStatus !== currentStatus) {
        console.log(`🔄 Status changed for API ${status.id}: ${prevStatus} → ${currentStatus}`);
        
        // Update last checked time
        setLastChecked(prev => ({
          ...prev,
          [status.id]: new Date()
        }));
        
        // Trigger flash animation
        setStatusChangeFlash(prev => ({
          ...prev,
          [status.id]: true
        }));
        
        // Clear flash after 2 seconds
        setTimeout(() => {
          setStatusChangeFlash(prev => ({
            ...prev,
            [status.id]: false
          }));
        }, 2000);
        
        // Trigger REAL notification for status changes
        if (currentStatus === 'down') {
          addNotification({
            message: `🚨 ${status.name} is DOWN`,
            type: 'error'
          });
        } else if (currentStatus === 'healthy' && prevStatus === 'down') {
          addNotification({
            message: `🎉 ${status.name} is back online`,
            type: 'success'
          });
        } else if (currentStatus === 'slow') {
          addNotification({
            message: `⚠️ ${status.name} is slow`,
            type: 'warning'
          });
        }
        
        // Update previous statuses
        prevStatusRef.current[status.id] = currentStatus;
      }
    });
  }, [apiStatuses, addNotification]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy': return { 
        variant: 'success' as const, 
        icon: <CheckCircle className="w-4 h-4" />, 
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        dotColor: 'bg-emerald-400',
        label: 'Healthy'
      };
      case 'slow': return { 
        variant: 'warning' as const, 
        icon: <Clock className="w-4 h-4" />, 
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        dotColor: 'bg-amber-400',
        label: 'Slow'
      };
      case 'down': return { 
        variant: 'danger' as const, 
        icon: <XCircle className="w-4 h-4" />, 
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        dotColor: 'bg-red-400',
        label: 'Down'
      };
      default: return { 
        variant: 'neutral' as const, 
        icon: <Activity className="w-4 h-4" />, 
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        dotColor: 'bg-gray-400',
        label: 'Unknown'
      };
    }
  };

  const getResponseColor = (time: number) => {
    if (time < 150) return 'text-green-400';
    if (time < 300) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResponseBarColor = (time: number) => {
    if (time < 150) return 'bg-green-400';
    if (time < 300) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getResponseBarWidth = (time: number) => {
    const max = 500;
    const percentage = Math.min((time / max) * 100, 100);
    return `${percentage}%`;
  };

  const getApiStatus = (apiId: number) => {
    const status = apiStatuses.find(s => s.id === apiId);
    return status || { id: apiId, name: '', url: '', status: 'unknown', responseTime: 0 };
  };

  const handleEdit = (api: {id: number; name: string; url: string}) => {
    setEditingApi(api);
    setFormData({ name: api.name, url: api.url });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingApi) return;
    if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      toast.error('❌ URL must start with http:// or https://');
      return;
    }
    try {
      const result = await updateApi(editingApi.id, formData);
      if (result) {
        toast.success('✅ API updated successfully!');
        setShowEditModal(false);
        setEditingApi(null);
        setFormData({ name: '', url: '' });
        refresh();
      } else {
        toast.error('❌ Failed to update API');
      }
    } catch {
      toast.error('❌ Failed to update API');
    }
  };

  const handleAddApi = async () => {
    try {
      const result = await createApi({
        name: formData.name,
        url: formData.url,
        method: 'GET',
        active: true
      });
      
      if (result) {
        toast.success('✅ API added successfully!');
        setShowAddModal(false);
        setFormData({ name: '', url: '' });
        refresh();
      } else {
        toast.error('❌ Failed to add API');
      }
    } catch {
      toast.error('❌ Failed to add API');
    }
  };

  const handleCheckNow = async (apiId: number) => {
    try {
      toast.loading('Checking API health...', { id: 'check-api' });
      
      const result = await checkApi(apiId);
      if (result) {
        toast.success(`✅ API checked successfully! Status: ${result.status}`, { id: 'check-api' });
        refresh(); // Refresh to get updated status
      } else {
        toast.error('❌ Failed to check API', { id: 'check-api' });
      }
    } catch (err) {
      console.error('Error checking API:', err);
      toast.error('❌ Failed to check API', { id: 'check-api' });
    }
  };

  const filteredApis = useMemo(() => {
    let filtered = [...apis];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(api => 
        api.name.toLowerCase().includes(query) || 
        api.url.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(api => {
        const status = getApiStatus(api.id);
        return status.status === statusFilter;
      });
    }
    return filtered;
  }, [apis, searchQuery, statusFilter, apiStatuses, getApiStatus]);

  if (loading) {
    return (
      <DashboardLayout title="🔍 Monitor APIs" subtitle="Detailed API monitoring and management">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="🔍 Monitor APIs" subtitle="Detailed API monitoring and management">
        <EmptyState type="error" action={{ label: 'Try Again', onClick: refresh }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="🔍 Monitor APIs" subtitle="Detailed API monitoring and management">
      {/* Top Header with Live Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">API Endpoints</h2>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            isLiveTracking 
              ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' 
              : 'bg-gray-700 text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isLiveTracking ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs font-medium">
              {isLiveTracking ? '● Live' : '○ Paused'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Auto-refresh controls */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                autoRefresh 
                  ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>Auto</span>
            </button>
            
            {/* Refresh interval selector */}
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300"
              disabled={!autoRefresh}
            >
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
          </div>
          
          {/* Last update time */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <Card variant="glass" className="mb-6 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search APIs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-64 transition-all" 
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Status</option>
                <option value="healthy">Healthy</option>
                <option value="slow">Slow</option>
                <option value="down">Down</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{filteredApis.length} of {apis.length} APIs</span>
            <Button variant="secondary" size="sm" onClick={refresh} icon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Add API</Button>
          </div>
        </div>
      </Card>

      {/* API Grid */}
      {filteredApis.length === 0 ? (
        <EmptyState 
          type="no-results" 
          action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setStatusFilter('all'); } }} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredApis.map((api, index) => {
              const status = getApiStatus(api.id);
              const statusConfig = getStatusConfig(status.status);
              
              return (
                <motion.div
                  key={api.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/api/${api.id}`)}
                  className="cursor-pointer"
                >
                  <Card 
                    variant={status.status === 'down' ? 'gradient' : 'glass'}
                    className={`bg-gray-900 border border-gray-800 rounded-xl p-5 hover:shadow-xl hover:shadow-black/60 hover:scale-[1.02] hover:border-gray-700 transition-all duration-300 group ${
                      statusChangeFlash[api.id] ? 'ring-2 ring-red-500/50' : ''
                    }`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <h3 className="font-semibold text-white truncate">{api.name}</h3>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <span className="truncate max-w-[200px]">{api.url}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </div>
                        </div>
                        <div className={`${statusConfig.bgColor} ${statusConfig.color} px-3 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium`}>
                          <span className={`w-2 h-2 ${statusConfig.dotColor} rounded-full`} />
                          {statusConfig.label}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/50 rounded-xl p-3 hover:bg-gray-800/70 transition-colors">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <p className="text-xs text-gray-500">Response Time</p>
                          </div>
                          <p className={`text-lg font-semibold ${getResponseColor(status.responseTime)}`}>
                            {status.responseTime}ms
                          </p>
                          {/* Mini Status Bar */}
                          <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-1 ${getResponseBarColor(status.responseTime)} rounded-full transition-all duration-500`}
                              style={{ width: getResponseBarWidth(status.responseTime) }}
                            />
                          </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3 hover:bg-gray-800/70 transition-colors">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Activity className="w-3 h-3 text-gray-500" />
                            <p className="text-xs text-gray-500">Last Checked</p>
                          </div>
                          <p className="text-xs font-medium text-gray-400">
                            {lastChecked[api.id] ? 
                              `${Math.floor((new Date().getTime() - lastChecked[api.id].getTime()) / 1000)}s ago` 
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Status Details */}
                      <div className="flex items-center justify-between py-3 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            status.status === 'healthy' ? 'bg-emerald-400' : 
                            status.status === 'down' ? 'bg-red-400 animate-pulse' : 
                            'bg-amber-400'
                          }`} />
                          <span className={`text-sm ${statusConfig.color}`}>
                            {status.status === 'healthy' ? 'Operating normally' : 
                             status.status === 'down' ? 'Service unavailable' : 
                             'Degraded performance'}
                          </span>
                          {/* Live indicator */}
                          {isLiveTracking && (
                            <div className="flex items-center gap-1 text-xs text-emerald-400">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              <span>Live</span>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${api.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                          {api.active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                          onClick={(e) => { e?.stopPropagation(); handleCheckNow(api.id); }}
                        >
                          Check Now
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center justify-center gap-1 transition-all"
                          onClick={(e) => { e?.stopPropagation(); handleEdit(api); }}
                        >
                          ✏️ Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {apis.length === 0 && (
        <EmptyState 
          type="no-apis" 
          action={{ label: 'Add First API', onClick: () => setShowAddModal(true) }} 
        />
      )}

      {/* Edit API Modal */}
      <AnimatePresence>
        {showEditModal && editingApi && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Edit API</h2>
                <button onClick={() => { setShowEditModal(false); setEditingApi(null); }} className="p-2 hover:bg-gray-800 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Name</label>
                  <input type="text" placeholder="e.g., User API" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API URL</label>
                  <input type="url" placeholder="https://api.example.com/health" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
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

      {/* Add API Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add New API</h2>
                <button onClick={() => { setShowAddModal(false); setFormData({ name: '', url: '' }); }} className="p-2 hover:bg-gray-800 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleAddApi(); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Name</label>
                  <input type="text" placeholder="e.g., User API" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API URL</label>
                  <input type="url" placeholder="https://api.example.com/health" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => { setShowAddModal(false); setFormData({ name: '', url: '' }); }}>Cancel</Button>
                  <Button variant="primary" type="submit">Add API</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ApiMonitorDashboard;
