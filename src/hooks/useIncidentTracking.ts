import { useState, useEffect, useCallback } from 'react';

export interface Incident {
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

export interface CreateIncidentRequest {
  apiName: string;
  apiId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

export interface CloseIncidentRequest {
  incidentId: string;
}

interface UseIncidentTrackingProps {
  apiId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useIncidentTracking = ({
  apiId,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: UseIncidentTrackingProps = {}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Base API URL
  const API_BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api/incidents`;

  // Fetch all incidents
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = apiId ? `${API_BASE_URL}?apiId=${apiId}` : API_BASE_URL;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If response is not JSON, throw a more informative error
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check backend API configuration.');
      }
      
      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [apiId]);

  // Start a new incident
  const startIncident = useCallback(async (request: CreateIncidentRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from start incident:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check backend API configuration.');
      }
      
      const newIncident = await response.json();
      setIncidents(prev => [newIncident, ...prev]);
      
      return newIncident;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start incident';
      setError(errorMessage);
      console.error('Error starting incident:', err);
      throw err;
    }
  }, []);

  // Close an incident
  const closeIncident = useCallback(async (request: CloseIncidentRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from close incident:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check backend API configuration.');
      }
      
      const updatedIncident = await response.json();
      setIncidents(prev => 
        prev.map(inc => 
          inc.id === updatedIncident.id ? updatedIncident : inc
        )
      );
      
      return updatedIncident;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to close incident';
      setError(errorMessage);
      console.error('Error closing incident:', err);
      throw err;
    }
  }, []);

  // Get active incidents for a specific API
  const getActiveIncident = useCallback((targetApiId: string) => {
    return incidents.find(inc => 
      inc.apiId === targetApiId && inc.status === 'active'
    );
  }, [incidents]);

  // Get incidents by status
  const getIncidentsByStatus = useCallback((status: 'active' | 'resolved') => {
    return incidents.filter(inc => inc.status === status);
  }, [incidents]);

  // Get incidents by API
  const getIncidentsByApi = useCallback((targetApiId: string) => {
    return incidents.filter(inc => inc.apiId === targetApiId);
  }, [incidents]);

  // Calculate statistics
  const getStatistics = useCallback(() => {
    const total = incidents.length;
    const active = incidents.filter(inc => inc.status === 'active').length;
    const resolved = incidents.filter(inc => inc.status === 'resolved').length;
    
    const resolvedWithDuration = incidents.filter(inc => inc.duration && inc.status === 'resolved');
    const avgDuration = resolvedWithDuration.length > 0
      ? resolvedWithDuration.reduce((sum, inc) => sum + (inc.duration || 0), 0) / resolvedWithDuration.length
      : 0;

    const bySeverity = incidents.reduce((acc, inc) => {
      acc[inc.severity] = (acc[inc.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      resolved,
      avgDuration,
      bySeverity
    };
  }, [incidents]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchIncidents();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchIncidents]);

  // Initial fetch
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
    startIncident,
    closeIncident,
    getActiveIncident,
    getIncidentsByStatus,
    getIncidentsByApi,
    getStatistics,
    refresh: fetchIncidents
  };
};
