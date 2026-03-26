import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Activity, CheckCircle, XCircle, AlertTriangle, TrendingUp, Calendar, Globe, Server, Zap } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getApiById, checkApi } from '../services/apiService';
import toast from 'react-hot-toast';

// Mock data generator
const generateMockHistory = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      uptime: 95 + Math.random() * 5,
      responseTime: 50 + Math.random() * 200,
      requests: Math.floor(Math.random() * 1000) + 500
    });
  }
  return data;
};

const generateHourlyData = () => {
  const data = [];
  for (let i = 24; i >= 0; i--) {
    data.push({
      hour: `${i}:00`,
      responseTime: 50 + Math.random() * 300,
      status: Math.random() > 0.9 ? 'error' : 'success'
    });
  }
  return data;
};

const ApiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [api, setApi] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckNow = async () => {
    if (!id) return;
    
    try {
      setChecking(true);
      toast.loading('Checking API health...', { id: 'check-api' });
      
      const result = await checkApi(Number(id));
      if (result) {
        toast.success(`✅ API checked successfully! Status: ${result.status}`, { id: 'check-api' });
        // Refresh API data to get updated status
        const apiData = await getApiById(Number(id));
        if (apiData) {
          setApi(apiData);
        }
      } else {
        toast.error('❌ Failed to check API', { id: 'check-api' });
      }
    } catch (err) {
      console.error('Error checking API:', err);
      toast.error('❌ Failed to check API', { id: 'check-api' });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const fetchApi = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const apiData = await getApiById(Number(id));
        if (apiData) {
          setApi(apiData);
        } else {
          setError('API not found');
        }
      } catch (err) {
        console.error('Error fetching API:', err);
        setError('Failed to load API details');
      } finally {
        setLoading(false);
      }
    };

    fetchApi();
  }, [id]);

  const hourlyData = useMemo(() => generateHourlyData(), []);
  const historyData = useMemo(() => generateMockHistory(), []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy': return { variant: 'success' as const, label: 'Healthy', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'degraded': return { variant: 'warning' as const, label: 'Degraded', color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'down': return { variant: 'danger' as const, label: 'Down', color: 'text-red-500', bg: 'bg-red-500/10' };
      default: return { variant: 'neutral' as const, label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
  };

  const getResponseColor = (time: number) => {
    if (time < 150) return 'text-green-400';
    if (time < 300) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/monitor')} icon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
            Back to APIs
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !api) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/monitor')} icon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
            Back to APIs
          </Button>
        </div>
        <EmptyState 
          type="error" 
          title={error || 'API not found'}
          action={{ label: 'Back to APIs', onClick: () => navigate('/monitor') }}
        />
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(api.status || 'healthy');

  return (
    <DashboardLayout>
      {/* Back Button & Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/monitor')} icon={<ArrowLeft className="w-4 h-4" />} className="mb-4 hover:bg-gray-800 transition-colors">
          Back to APIs
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{api?.name || 'Unknown API'}</h1>
              <div className={`${statusConfig.bg} ${statusConfig.color} px-3 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium`}>
                <span className={`w-2 h-2 rounded-full ${api?.status === 'healthy' ? 'bg-emerald-400' : api?.status === 'down' ? 'bg-red-400 animate-pulse' : 'bg-amber-400'}`} />
                {statusConfig.label}
              </div>
              <span className="text-emerald-400 text-xs animate-pulse flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                ● Live
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Globe className="w-4 h-4" />
              <span className="font-mono text-sm">{api?.url || 'No URL'}</span>
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-medium">{api?.method || 'GET'}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="hover:bg-gray-800 transition-colors">Edit API</Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              onClick={handleCheckNow}
              loading={checking}
            >
              {checking ? 'Checking...' : 'Run Check'}
            </Button>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wide font-medium">Performance Metrics</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Uptime"
          value={`${api?.uptime}%`}
          subtitle="Last 30 days"
          icon={<CheckCircle className="w-5 h-5" />}
          variant="success"
          trend={{ value: 0.1, label: 'vs last month', positive: true }}
        />
        <MetricCard
          title="Avg Response"
          value={`${api?.avgResponseTime}ms`}
          subtitle="Last 24 hours"
          icon={<Clock className="w-5 h-5" />}
          variant={api?.avgResponseTime > 200 ? 'warning' : 'default'}
          trend={{ value: -12, label: 'faster', positive: true }}
        />
        <MetricCard
          title="Total Requests"
          value={(api?.totalRequests || 0).toLocaleString()}
          subtitle="Last 24 hours"
          icon={<Activity className="w-5 h-5" />}
          variant="default"
          trend={{ value: 8, label: 'vs yesterday', positive: true }}
        />
        <MetricCard
          title="Error Rate"
          value={`${((api?.errorRate || 0) * 100).toFixed(2)}%`}
          subtitle="Failed requests"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={(api?.errorRate || 0) > 0.05 ? 'warning' : 'default'}
          trend={{ value: -0.01, label: 'improvement', positive: true }}
        />
      </div>

      {/* Charts Row */}
      <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wide font-medium">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Response Time Chart */}
        <Card variant="glass" className="bg-gray-900/70 backdrop-blur-md border border-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Response Time
              </h3>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['24h', '7d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeRange === range 
                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="ms" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  fill="url(#responseGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Uptime History */}
        <Card variant="glass" className="bg-gray-900/70 backdrop-blur-md border border-gray-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Uptime History (30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickFormatter={(val) => val.split('/')[0]} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[95, 100]} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* API Info & Recent Activity */}
      <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wide font-medium">Details & Activity</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Details */}
        <Card variant="glass" className="bg-gray-900/70 backdrop-blur-md border border-gray-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">API Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Method</span>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-sm font-medium rounded">{api?.method || 'GET'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Status</span>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${api?.active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                  <span className="text-sm text-white font-medium">{api?.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Created</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-white">{api?.createdAt ? new Date(api.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Last Checked</span>
                <span className="text-sm text-white">{api?.updatedAt ? new Date(api.updatedAt).toLocaleString() : 'Never'}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2 text-gray-300">Description</h4>
              <p className="text-sm text-gray-400">No description available</p>
            </div>
          </div>
        </Card>

        {/* Recent Checks */}
        <Card variant="glass" className="lg:col-span-2 bg-gray-900/70 backdrop-blur-md border border-gray-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Checks
            </h3>
            <div className="space-y-3">
              {hourlyData.slice(-5).reverse().map((check, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-800 transition rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${check.status === 'success' ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
                    <span className="text-sm font-medium text-white">Health Check #{5 - idx}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${getResponseColor(check.responseTime)}`}>
                      {Math.round(check.responseTime)}ms
                    </span>
                    <span className="text-xs text-gray-500">{check.hour}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ApiDetailPage;
