import { useState, useCallback, useRef, useEffect } from 'react';
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

interface UseApiMonitorReturn {
  apis: ApiData[];
  loadingId: string | null;
  loadingIds: Set<string>;
  previousStatuses: Map<string, string>;
  handleCheckApi: (id: string, retries?: number) => Promise<void>;
  handleDeleteApi: (id: string) => Promise<void>;
  handleAddApi: (name: string, url: string) => Promise<void>;
  handleBulkCheck: (ids: string[]) => Promise<void>;
  handleBulkDelete: (ids: string[]) => Promise<void>;
  updateApi: (id: string, updates: Partial<ApiData>) => void;
  getResponseColor: (time: number) => string;
  playAlertSound: () => void;
}

export const useApiMonitor = (): UseApiMonitorReturn => {
  const [apis, setApis] = useState<ApiData[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [previousStatuses, setPreviousStatuses] = useState<Map<string, string>>(new Map());
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllersRef.current.forEach(controller => controller.abort());
      controllersRef.current.clear();
    };
  }, []);

  // Alert sound function
  const playAlertSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if audio is not supported
      });
    } catch {
      // Silently fail
    }
  }, []);

  // Enhanced alert system with state tracking
  useEffect(() => {
    apis.forEach(api => {
      const prevStatus = previousStatuses.get(api.id);
      
      // Only alert on status change TO down
      if (prevStatus !== 'down' && api.status === 'down') {
        toast.error(`🚨 ${api.name} is DOWN`, {
          duration: 5000,
          icon: '🔴',
        });
        
        // Play alert sound
        playAlertSound();
        
        // Update browser title
        document.title = `🔴 ${api.name} DOWN - API Doctor`;
        
        // Reset title after 5 seconds
        setTimeout(() => {
          document.title = 'API Doctor - Real-time API Monitoring';
        }, 5000);
      }
      
      // Alert on recovery
      if (prevStatus === 'down' && api.status === 'healthy') {
        toast.success(`✅ ${api.name} is RECOVERED`, {
          duration: 3000,
          icon: '🟢',
        });
      }
    });
    
    // Update previous statuses
    setPreviousStatuses(prev => {
      const newMap = new Map(prev);
      apis.forEach(api => {
        newMap.set(api.id, api.status);
      });
      return newMap;
    });
  }, [apis, previousStatuses, playAlertSound]);

  // Retry mechanism with exponential backoff
  const handleCheckApi = useCallback(async (id: string, retries: number = 1) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Cancel existing request
        const existingController = controllersRef.current.get(id);
        if (existingController) {
          existingController.abort();
        }
        
        // Create new controller
        const controller = new AbortController();
        controllersRef.current.set(id, controller);
        
        setLoadingId(id);
        setLoadingIds(prev => new Set(prev).add(id));
        
        // Show checking status immediately
        updateApi(id, { status: 'checking' });
        
        // Mock response since backend doesn't exist yet
        const mockResponse = await new Promise<Response>((resolve) => {
          setTimeout(() => {
            const api = apis.find(a => a.id === id);
            const mockApi = {
              ...api,
              status: Math.random() > 0.3 ? 'healthy' as const : 'down' as const,
              avgResponseTime: Math.floor(Math.random() * 200) + 50,
              uptime: Math.floor(Math.random() * 10) + 90,
              errorRate: Math.random() * 5,
              lastChecked: new Date().toISOString(),
            };
            resolve(new Response(JSON.stringify(mockApi), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }, 1000 + Math.random() * 1000); // 1-2 second delay
        });
        
        const updatedApi = await mockResponse.json();
        updateApi(id, updatedApi);
        
        toast.success(`✅ ${updatedApi.name} checked successfully!`);
        return; // Success, exit retry loop
      } catch (err: unknown) {
        const error = err as Error;
        if (attempt === retries) {
          // Final attempt failed, update to down
          const api = apis.find(a => a.id === id);
          if (api) {
            updateApi(id, { 
              status: 'down',
              lastChecked: new Date().toISOString()
            });
          }
          toast.error(`❌ ${apis.find(a => a.id === id)?.name || 'API'} failed after ${retries} attempts`);
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }
  }, [apis]);

  const handleDeleteApi = useCallback(async (id: string) => {
    const apiToDelete = apis.find(api => api.id === id);
    if (!apiToDelete) return;
    
    try {
      // Cancel any ongoing request
      const controller = controllersRef.current.get(id);
      if (controller) {
        controller.abort();
        controllersRef.current.delete(id);
      }
      
      // Mock delete since backend isn't running
      setApis(prev => prev.filter(api => api.id !== id));
      toast.success(`🗑️ ${apiToDelete.name} deleted successfully!`);
    } catch (err: unknown) {
      toast.error(`❌ Failed to delete ${apiToDelete.name}`);
    }
  }, [apis]);

  const handleAddApi = useCallback(async (name: string, url: string) => {
    try {
      // Real API call to backend
      const response = await fetch('/api/apis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          url,
          active: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newApi = await response.json();
      
      setApis(prev => [...prev, newApi]);
      toast.success(`✅ ${name} added successfully!`);
      
      // Auto-check new API after 2 seconds
      setTimeout(() => {
        handleCheckApi(newApi.id, 2);
      }, 2000);
    } catch (err: unknown) {
      console.error('Error adding API:', err);
      toast.error(`❌ Failed to add ${name}`);
    }
  }, [handleCheckApi]);

  const handleBulkCheck = useCallback(async (ids: string[]) => {
    const promises = ids.map(id => handleCheckApi(id));
    await Promise.allSettled(promises);
    toast.success(`✅ Checking ${ids.length} APIs`);
  }, [handleCheckApi]);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    const promises = ids.map(id => handleDeleteApi(id));
    await Promise.allSettled(promises);
    toast.success(`🗑️ Deleted ${ids.length} APIs`);
  }, [handleDeleteApi]);

  const updateApi = useCallback((id: string, updates: Partial<ApiData>) => {
    setApis(prev => prev.map(api => 
      api.id === id ? { ...api, ...updates } : api
    ));
  }, []);

  const getResponseColor = useCallback((time: number) => {
    if (time > 500) return 'text-red-400';
    if (time > 200) return 'text-yellow-400';
    return 'text-green-400';
  }, []);

  return {
    apis,
    loadingId,
    loadingIds,
    previousStatuses,
    handleCheckApi,
    handleDeleteApi,
    handleAddApi,
    handleBulkCheck,
    handleBulkDelete,
    updateApi,
    getResponseColor,
    playAlertSound,
  };
};
