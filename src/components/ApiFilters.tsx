import React, { useState } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

interface FilterState {
  search: string;
  status: 'all' | 'healthy' | 'down' | 'checking' | 'slow';
  sortBy: 'name' | 'responseTime' | 'uptime' | 'lastChecked';
  sortOrder: 'asc' | 'desc';
  responseTimeRange: 'all' | 'fast' | 'medium' | 'slow';
}

interface ApiFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export const ApiFilters: React.FC<ApiFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      responseTimeRange: 'all'
    });
  };

  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.responseTimeRange !== 'all';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Filters & Search
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredCount} of {totalCount} APIs
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search APIs by name or URL..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="healthy">🟢 Healthy</option>
              <option value="down">🔴 Down</option>
              <option value="checking">🔄 Checking</option>
              <option value="slow">🟡 Slow</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Name</option>
                <option value="responseTime">Response Time</option>
                <option value="uptime">Uptime</option>
                <option value="lastChecked">Last Checked</option>
              </select>
              
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                title={`Sort ${filters.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                <SortAsc className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${
                  filters.sortOrder === 'desc' ? 'transform rotate-180' : ''
                }`} />
              </button>
            </div>
          </div>

          {/* Response Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Response Time
            </label>
            <select
              value={filters.responseTimeRange}
              onChange={(e) => handleFilterChange('responseTimeRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Response Times</option>
              <option value="fast">⚡ Fast (&lt;100ms)</option>
              <option value="medium">🐢 Medium (100-500ms)</option>
              <option value="slow">🐌 Slow (&gt;500ms)</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quick Actions
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('status', 'down')}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30"
              >
                Show Down
              </button>
              <button
                onClick={() => handleFilterChange('status', 'healthy')}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30"
              >
                Show Healthy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              Search: "{filters.search}"
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
              Status: {filters.status}
            </span>
          )}
          {filters.responseTimeRange !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
              Response: {filters.responseTimeRange}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
