import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

interface ApiData {
  id: string;
  name: string;
  status: 'healthy' | 'down' | 'checking' | 'slow';
  avgResponseTime?: number;
  uptime?: number;
  lastChecked?: string;
}

interface AlertSystemOptions {
  enableSound?: boolean;
  enableBrowserTitle?: boolean;
  toastDuration?: number;
  customSoundUrl?: string;
}

interface UseAlertSystemReturn {
  previousStatuses: Map<string, string>;
  activeAlerts: Set<string>;
  triggerAlert: (api: ApiData, previousStatus?: string) => void;
  clearAlert: (apiId: string) => void;
  clearAllAlerts: () => void;
  playAlertSound: () => void;
  updateBrowserTitle: (alertCount: number) => void;
}

export const useAlertSystem = (options: AlertSystemOptions = {}): UseAlertSystemReturn => {
  const {
    enableSound = true,
    enableBrowserTitle = true,
    toastDuration = 5000,
    customSoundUrl
  } = options;

  const [previousStatuses, setPreviousStatuses] = useState<Map<string, string>>(new Map());
  const [activeAlerts, setActiveAlerts] = useState<Set<string>>(new Set());
  const originalTitleRef = useRef<string>(document.title);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (enableSound) {
      if (customSoundUrl) {
        audioRef.current = new Audio(customSoundUrl);
      } else {
        // Default alert sound (base64 encoded beep)
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      }
      
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.preload = 'auto';
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [enableSound, customSoundUrl]);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail if audio is not supported or blocked
        console.warn('Alert sound could not be played');
      });
    }
  }, [enableSound]);

  // Update browser title
  const updateBrowserTitle = useCallback((alertCount: number) => {
    if (!enableBrowserTitle) return;

    if (alertCount > 0) {
      document.title = `🔴 ${alertCount} API${alertCount > 1 ? 's' : ''} DOWN - API Doctor`;
    } else {
      document.title = originalTitleRef.current;
    }
  }, [enableBrowserTitle]);

  // Trigger alert for API status change
  const triggerAlert = useCallback((api: ApiData, previousStatus?: string) => {
    const currentStatus = api.status;
    const apiId = api.id;
    const apiName = api.name;

    // Get previous status from map if not provided
    const prevStatus = previousStatus || previousStatuses.get(apiId);

    // Only alert on status change TO down (from healthy or checking)
    if (prevStatus !== 'down' && currentStatus === 'down') {
      // Add to active alerts
      setActiveAlerts(prev => new Set(prev).add(apiId));
      
      // Show toast notification
      toast.error(`🚨 ${apiName} is DOWN`, {
        duration: toastDuration,
        icon: '🔴',
        style: {
          borderLeft: '4px solid #ef4444',
          paddingLeft: '16px',
        },
        // Add action buttons
        action: {
          label: 'Check Now',
          onClick: () => {
            // This would trigger an immediate check of the API
            console.log(`Manual check triggered for ${apiName}`);
          },
        },
      });

      // Play alert sound
      playAlertSound();

      // Update browser title
      updateBrowserTitle(activeAlerts.size + 1);

      // Optional: Log alert for analytics
      console.log(`🚨 ALERT TRIGGERED: ${apiName} changed from ${prevStatus} to ${currentStatus}`);
    }

    // Alert on recovery (optional - shows success notification)
    if (prevStatus === 'down' && currentStatus === 'healthy') {
      // Remove from active alerts
      setActiveAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(apiId);
        return newSet;
      });

      // Show recovery toast
      toast.success(`✅ ${apiName} is RECOVERED`, {
        duration: 3000,
        icon: '🟢',
        style: {
          borderLeft: '4px solid #10b981',
          paddingLeft: '16px',
        },
      });

      // Update browser title
      updateBrowserTitle(Math.max(0, activeAlerts.size - 1));

      console.log(`✅ RECOVERY: ${apiName} changed from ${prevStatus} to ${currentStatus}`);
    }

    // Update previous status map
    setPreviousStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(apiId, currentStatus);
      return newMap;
    });
  }, [previousStatuses, activeAlerts.size, toastDuration, playAlertSound, updateBrowserTitle]);

  // Clear specific alert
  const clearAlert = useCallback((apiId: string) => {
    setActiveAlerts(prev => {
      const newSet = new Set(prev);
      newSet.delete(apiId);
      updateBrowserTitle(newSet.size);
      return newSet;
    });
  }, [updateBrowserTitle]);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setActiveAlerts(new Set());
    updateBrowserTitle(0);
  }, [updateBrowserTitle]);

  // Reset browser title on unmount
  useEffect(() => {
    return () => {
      if (enableBrowserTitle) {
        document.title = originalTitleRef.current;
      }
    };
  }, [enableBrowserTitle]);

  return {
    previousStatuses,
    activeAlerts,
    triggerAlert,
    clearAlert,
    clearAllAlerts,
    playAlertSound,
    updateBrowserTitle,
  };
};
