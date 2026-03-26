import { useEffect, useState, useCallback } from "react";
import { getApis, checkAllApisHealth } from "../services/apiService";
import type { ApiConfig, ApiStatus } from "../services/apiService";
import { useIncidentTracking } from "./useIncidentTracking";

export const useApiMonitor = () => {
  const [apis, setApis] = useState<ApiConfig[]>([]);
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { startIncident } = useIncidentTracking();

  const createIncidentForApi = useCallback(async (api: ApiStatus) => {
    try {
      await startIncident({
        apiName: api.name,
        apiId: api.id.toString(),
        severity: 'high',
        description: `${api.name} went down during health check`
      });
      console.log(`🚨 Incident created for ${api.name}`);
    } catch (error) {
      console.error(`Failed to create incident for ${api.name}:`, error);
    }
  }, [startIncident]);

  const fetchApis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApis();
      setApis(data);
    } catch (err) {
      console.error("Error fetching APIs", err);
      setError("Failed to fetch APIs");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const statuses = await checkAllApisHealth();
      setApiStatuses(statuses);
    } catch (err) {
      console.error("Error checking API health", err);
      setError("Failed to check API health");
    }
  }, []);

  const refresh = useCallback(() => {
    fetchApis();
    checkHealth();
  }, [fetchApis, checkHealth]);

  useEffect(() => {
    fetchApis();
    checkHealth();

    // Set up polling for health checks every 10 seconds
    const interval = setInterval(() => {
      checkHealth();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchApis, checkHealth]);

  // Trigger alerts and incidents when status changes
  useEffect(() => {
    const previousStatuses = new Map<number, string>();
    
    apiStatuses.forEach(status => {
      const prev = previousStatuses.get(status.id);
      
      if (prev && prev !== "down" && status.status === "down") {
        // API went down - trigger alert and create incident
        triggerAlert(status, prev);
        createIncidentForApi(status);
      } else if (prev && prev === "down" && status.status !== "down") {
        // API recovered - trigger recovery alert
        triggerRecoveryAlert(status, prev);
      }
      
      previousStatuses.set(status.id, status.status);
    });
  }, [apiStatuses, createIncidentForApi]);

  const triggerAlert = (api: ApiStatus, previousStatus: string) => {
    console.warn(`🚨 ALERT: ${api.name} is DOWN!`);
    console.log(`Previous status: ${previousStatus}, Current status: ${api.status}`);
    
    // Browser notification
    if (Notification.permission === "granted") {
      new Notification(`API Alert: ${api.name}`, {
        body: `${api.name} is currently down. Response time: ${api.responseTime}ms`,
        icon: "/favicon.ico"
      });
    }
  };

  const triggerRecoveryAlert = (api: ApiStatus, previousStatus: string) => {
    console.log(`✅ RECOVERY: ${api.name} is BACK UP!`);
    console.log(`Previous status: ${previousStatus}, Current status: ${api.status}`);
    
    // Browser notification
    if (Notification.permission === "granted") {
      new Notification(`API Recovery: ${api.name}`, {
        body: `${api.name} is back online. Response time: ${api.responseTime}ms`,
        icon: "/favicon.ico"
      });
    }
  };

  return { 
    apis, 
    apiStatuses, 
    loading, 
    error, 
    refresh,
    triggerAlert,
    triggerRecoveryAlert,
    createIncidentForApi
  };
};
