import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Activity, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import IncidentHistory from '../components/IncidentHistory';
import DashboardLayout from '../components/DashboardLayout';
import { getIncidents, createIncident } from '../services/incidentService';
import toast from 'react-hot-toast';

// Import type separately
type Incident = import('../hooks/useIncidentTracking').Incident;

const IncidentTrackingDemo: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIncident, setNewIncident] = useState({
    apiName: '',
    apiId: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: ''
  });

  // Fetch real incidents from backend
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIncidents();
        setIncidents(data);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Failed to load incidents');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
    
    // Auto-refresh every 30 seconds for real-time monitoring
    const interval = setInterval(fetchIncidents, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const incidentData = {
        apiName: newIncident.apiName,
        apiId: newIncident.apiId || `${newIncident.apiName.toLowerCase().replace(/\s+/g, '-')}-api`,
        severity: newIncident.severity,
        description: newIncident.description,
        status: 'active' as const
      };
      
      const createdIncident = await createIncident(incidentData);
      
      // Add to local state immediately for better UX
      setIncidents(prev => [createdIncident, ...prev]);
      
      toast.success(`✅ Incident created for ${newIncident.apiName}`);
      
      // Reset form
      setNewIncident({
        apiName: '',
        apiId: '',
        severity: 'medium',
        description: ''
      });
      setShowCreateForm(false);
      
    } catch (err) {
      console.error('Error creating incident:', err);
      toast.error('❌ Failed to create incident');
    }
  };

  const stats = useMemo(() => {
    if (incidents.length === 0) {
      return { total: 0, active: 0, resolved: 0, avgDuration: 0 };
    }
    
    const incidentsWithDuration = incidents.filter(inc => inc.duration);
    const avgDuration = incidentsWithDuration.length > 0
      ? incidentsWithDuration.reduce((sum, inc) => sum + (inc.duration || 0), 0) / incidentsWithDuration.length
      : 0;
    
    return {
      total: incidents.length,
      active: incidents.filter(inc => inc.status === 'active').length,
      resolved: incidents.filter(inc => inc.status === 'resolved').length,
      avgDuration
    };
  }, [incidents]);

  return (
    <DashboardLayout 
      title="🚨 Incidents"
      subtitle="Monitor and manage API incidents with automatic tracking and resolution"
    >
      <span className="text-green-400 text-xs ml-3 animate-pulse">
        ● Live Tracking
      </span>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Incidents
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.total}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Incidents
                </p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.active}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg Duration
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round(stats.avgDuration)}m
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition text-white rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Incident
            </button>
            
            <button
              onClick={() => console.log('Demo: Refresh simulated')}
              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 transition text-white rounded-lg"
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Create Incident Form */}
        {showCreateForm && (
          <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Create New Incident
            </h3>
            
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    API Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newIncident.apiName}
                    onChange={(e) => setNewIncident({...newIncident, apiName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    placeholder="e.g., User API"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    API ID
                  </label>
                  <input
                    type="text"
                    value={newIncident.apiId}
                    onChange={(e) => setNewIncident({...newIncident, apiId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    placeholder="e.g., user-api (optional)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({...newIncident, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical'})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                  rows={3}
                  placeholder="Describe the incident..."
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition text-white rounded-lg"
                >
                  Create Incident
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition text-white rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Incident History */}
        <IncidentHistory
          incidents={incidents}
          loading={loading}
          error={error}
          onRefresh={() => {
            // Refresh incidents
            const fetchIncidents = async () => {
              try {
                setLoading(true);
                setError(null);
                const data = await getIncidents();
                setIncidents(data);
                toast.success('Incidents refreshed');
              } catch (err) {
                console.error('Error refreshing incidents:', err);
                setError('Failed to refresh incidents');
                toast.error('Failed to refresh incidents');
              } finally {
                setLoading(false);
              }
            };
            fetchIncidents();
          }}
          maxItems={50}
          showApiFilter={true}
          showStatusFilter={true}
        />

        {/* Features Documentation */}
        <div className="mt-8 bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold text-white mb-4">
            🎯 Incident Tracking Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition">
              <h3 className="font-medium text-white mb-2">🔧 Automatic Tracking</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Auto-create incidents when API goes down</li>
                <li>• Auto-close incidents when API recovers</li>
                <li>• Calculate duration automatically</li>
                <li>• Track severity levels</li>
              </ul>
            </div>
            
            <div className="rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition">
              <h3 className="font-medium text-white mb-2">📊 Management Features</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Filter by API, status, severity</li>
                <li>• Search incidents by description</li>
                <li>• Real-time statistics dashboard</li>
                <li>• Manual incident creation/closure</li>
              </ul>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default IncidentTrackingDemo;
