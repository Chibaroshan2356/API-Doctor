import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Filter, RefreshCw, Trash2, Plus, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { calculateHealthScore, getHealthScoreColor, getHealthScoreBgColor } from '../utils/healthScore';
import { ApiFilters, FilterState } from './ApiFilters';
import toast from 'react-hot-toast';

interface ApiData {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'down' | 'checking' | 'slow';
  avgResponseTime?: number;
  uptime?: number;
  errorRate?: number;
  lastChecked?: string;
  healthScore?: number;
  pinned?: boolean;
  favorite?: boolean;
}

interface ApiManagementProps {
  apis: ApiData[];
  onAddApi: (name: string, url: string) => Promise<void>;
  onDeleteApi: (id: string) => Promise<void>;
  onCheckApi: (id: string) => Promise<void>;
  onBulkCheck?: (ids: string[]) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  loadingId: string | null;
  loadingIds?: Set<string>;
}

export const ApiManagement: React.FC<ApiManagementProps> = ({
  apis,
  onAddApi,
  onDeleteApi,
  onCheckApi,
  onBulkCheck,
  onBulkDelete,
  loadingId,
  loadingIds = new Set()
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApiName, setNewApiName] = useState('');
  const [newApiUrl, setNewApiUrl] = useState('');
  const [selectedApis, setSelectedApis] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    responseTimeRange: 'all'
  });
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllersRef.current.forEach(controller => controller.abort());
      controllersRef.current.clear();
    };
  }, []);

  // Filter and sort APIs
  const filteredAndSortedApis = useCallback(() => {
    let filtered = apis.filter(api => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!api.name.toLowerCase().includes(searchLower) && 
            !api.url.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && api.status !== filters.status) {
        return false;
      }

      // Response time range filter
      if (filters.responseTimeRange !== 'all' && api.avgResponseTime) {
        switch (filters.responseTimeRange) {
          case 'fast':
            if (api.avgResponseTime >= 100) return false;
            break;
          case 'medium':
            if (api.avgResponseTime < 100 || api.avgResponseTime > 500) return false;
            break;
          case 'slow':
            if (api.avgResponseTime <= 500) return false;
            break;
        }
      }

      return true;
    });

    // Sort APIs
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'responseTime':
          aValue = a.avgResponseTime || 0;
          bValue = b.avgResponseTime || 0;
          break;
        case 'uptime':
          aValue = a.uptime || 0;
          bValue = b.uptime || 0;
          break;
        case 'lastChecked':
          aValue = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
          bValue = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Add health scores
    return filtered.map(api => ({
      ...api,
      healthScore: calculateHealthScore(api).score
    }));
  }, [apis, filters]);

  const filteredApis = filteredAndSortedApis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newApiName.trim() || !newApiUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic URL validation
    try {
      new URL(newApiUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      await onAddApi(newApiName.trim(), newApiUrl.trim());
      setNewApiName('');
      setNewApiUrl('');
      setShowAddForm(false);
      toast.success('API added successfully');
    } catch (error) {
      toast.error('Failed to add API');
    }
  };

  const handleDelete = async (id: string) => {
    const api = apis.find(a => a.id === id);
    if (!api) return;

    if (window.confirm(`Are you sure you want to delete "${api.name}"?`)) {
      try {
        await onDeleteApi(id);
        toast.success('API deleted successfully');
      } catch (error) {
        toast.error('Failed to delete API');
      }
    }
  };

  const handleCheck = async (id: string) => {
    try {
      await onCheckApi(id);
    } catch (error) {
      toast.error('Failed to check API');
    }
  };

  const handleSelectAll = () => {
    if (selectedApis.size === filteredApis.length) {
      setSelectedApis(new Set());
    } else {
      setSelectedApis(new Set(filteredApis.map(api => api.id)));
    }
  };

  const handleBulkCheck = async () => {
    if (selectedApis.size === 0) return;
    
    if (onBulkCheck) {
      try {
        await onBulkCheck(Array.from(selectedApis));
        toast.success(`Checking ${selectedApis.size} APIs`);
      } catch (error) {
        toast.error('Failed to check APIs');
      }
    } else {
      // Fallback: check individually
      const promises = Array.from(selectedApis).map(id => onCheckApi(id));
      await Promise.all(promises);
      toast.success(`Checked ${selectedApis.size} APIs`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApis.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedApis.size} APIs?`)) {
      if (onBulkDelete) {
        try {
          await onBulkDelete(Array.from(selectedApis));
          toast.success(`Deleted ${selectedApis.size} APIs`);
        } catch (error) {
          toast.error('Failed to delete APIs');
        }
      } else {
        // Fallback: delete individually
        const promises = Array.from(selectedApis).map(id => onDeleteApi(id));
        await Promise.all(promises);
        toast.success(`Deleted ${selectedApis.size} APIs`);
      }
      setSelectedApis(new Set());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          API Management
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add API</span>
        </button>
      </div>

      {/* Filters */}
      <ApiFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={apis.length}
        filteredCount={filteredApis.length}
      />

      {/* Bulk Actions */}
      {selectedApis.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedApis.size} API{selectedApis.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkCheck}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Check All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete All
              </button>
              <button
                onClick={() => setSelectedApis(new Set())}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add API Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Add New API
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Name
              </label>
              <input
                type="text"
                value={newApiName}
                onChange={(e) => setNewApiName(e.target.value)}
                placeholder="e.g., User API"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API URL
              </label>
              <input
                type="url"
                value={newApiUrl}
                onChange={(e) => setNewApiUrl(e.target.value)}
                placeholder="e.g., https://api.example.com/health"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add API
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredApis.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p>No APIs found</p>
            <p className="text-sm">Try adjusting your filters or add a new API</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApis.size === filteredApis.length && filteredApis.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    API
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApis.map((api) => (
                  <tr
                    key={api.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedApis.has(api.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApis(prev => new Set(prev).add(api.id));
                          } else {
                            setSelectedApis(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(api.id);
                              return newSet;
                            });
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {api.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {api.url}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={api.status}
                        responseTime={api.avgResponseTime}
                        lastChecked={api.lastChecked}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getHealthScoreBgColor(api.healthScore || 0)} ${getHealthScoreColor(api.healthScore || 0)}`}>
                        {api.healthScore || 0}/100
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {api.avgResponseTime || 0}ms
                        </span>
                        {api.avgResponseTime && api.avgResponseTime > 500 && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {api.uptime || 0}%
                        </span>
                        {api.uptime && api.uptime >= 99 && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {api.lastChecked 
                            ? new Date(api.lastChecked).toLocaleTimeString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleCheck(api.id)}
                          disabled={loadingId === api.id || loadingIds.has(api.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Check API"
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingId === api.id || loadingIds.has(api.id) ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(api.id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Delete API"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
