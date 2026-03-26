import React from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';

interface Incident {
  id: string;
  apiName: string;
  apiId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  status: 'active' | 'resolved';
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface IncidentHistoryProps {
  incidents: Incident[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  maxItems?: number;
  showApiFilter?: boolean;
  showStatusFilter?: boolean;
}

const IncidentHistory: React.FC<IncidentHistoryProps> = ({
  incidents,
  loading = false,
  error,
  onRefresh,
  maxItems = 50,
  showApiFilter = true,
  showStatusFilter = true
}) => {
  // Filter states
  const [selectedApi, setSelectedApi] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Get unique APIs for filter
  const uniqueApis = React.useMemo(() => {
    const apis = new Set(incidents.map(inc => inc.apiName));
    return Array.from(apis).sort();
  }, [incidents]);

  // Filter incidents
  const filteredIncidents = React.useMemo(() => {
    return incidents
      .filter(incident => {
        // API filter
        if (selectedApi !== 'all' && incident.apiName !== selectedApi) {
          return false;
        }
        // Status filter
        if (selectedStatus !== 'all' && incident.status !== selectedStatus) {
          return false;
        }
        // Search filter
        if (searchTerm && !incident.apiName.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .slice(0, maxItems);
  }, [incidents, selectedApi, selectedStatus, searchTerm, maxItems]);

  // Format duration
  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    
    if (duration < 60) {
      return `${Math.round(duration)}m`;
    } else if (duration < 1440) {
      const hours = Math.floor(duration / 60);
      const minutes = Math.round(duration % 60);
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(duration / 1440);
      const hours = Math.floor((duration % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  };

  // Format date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter(inc => inc.status === 'active').length;
    const resolved = incidents.filter(inc => inc.status === 'resolved').length;
    const avgDuration = incidents
      .filter(inc => inc.duration)
      .reduce((sum, inc) => sum + (inc.duration || 0), 0) / 
      incidents.filter(inc => inc.duration).length;

    return { total, active, resolved, avgDuration };
  }, [incidents]);

  if (loading) {
    return (
      <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-800 rounded-lg"></div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error Loading Incidents
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-xl p-5">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Incident History
          </h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-800 hover:bg-gray-700 transition rounded-lg">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Incidents</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 hover:bg-red-500/20 transition rounded-lg">
            <div className="text-2xl font-bold text-red-400">{stats.active}</div>
            <div className="text-xs text-red-400">Active</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 hover:bg-green-500/20 transition rounded-lg">
            <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
            <div className="text-xs text-green-400">Resolved</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 hover:bg-blue-500/20 transition rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {formatDuration(stats.avgDuration)}
            </div>
            <div className="text-xs text-blue-400">Avg Duration</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {showApiFilter && (
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedApi}
                onChange={(e) => setSelectedApi(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
              >
                <option value="all">All APIs</option>
                {uniqueApis.map(api => (
                  <option key={api} value={api}>{api}</option>
                ))}
              </select>
            </div>
          )}
          
          {showStatusFilter && (
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
          
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search API name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
            />
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="divide-y divide-gray-800">
        {filteredIncidents.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            🚫 No incidents detected
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const startDateTime = formatDateTime(incident.startTime);
            const endDateTime = incident.endTime ? formatDateTime(incident.endTime) : null;
            
            return (
              <div
                key={incident.id}
                className="flex justify-between items-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${incident.status === 'active' ? 'bg-red-400' : 'bg-green-400'} rounded-full`}></span>
                    <span className="text-gray-400 text-sm">Incident #{incident.id}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">API Down - {incident.apiName}</p>
                    <p className="text-xs text-gray-400">Started {startDateTime.date} at {startDateTime.time}</p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  incident.status === 'active' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {incident.status === 'active' ? 'Active' : 'Resolved'}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredIncidents.length >= maxItems && incidents.length > maxItems && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {/* Handle load more */}}
            className="w-full px-4 py-2 text-center text-blue-400 hover:text-blue-300 font-medium transition"
          >
            Load More Incidents
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentHistory;
