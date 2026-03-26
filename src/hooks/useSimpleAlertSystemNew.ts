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
  playAlertSound: (type?: 'down' | 'recovery' | 'warning') => void;
  updateBrowserTitle: (alertCount: number) => void;
}

export const useSimpleAlertSystem = (options: AlertSystemOptions = {}): UseAlertSystemReturn => {
  const {
    enableSound = true,
    enableBrowserTitle = true,
    toastDuration = 5000,
    customSoundUrl
  } = options;

  const [previousStatuses, setPreviousStatuses] = useState<Map<string, string>>(new Map());
  const [activeAlerts, setActiveAlerts] = useState<Set<string>>(new Set());
  const originalTitleRef = useRef<string>(document.title);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isAudioInitializedRef = useRef(false);

  // Initialize Web Audio API (most reliable)
  useEffect(() => {
    if (enableSound && !isAudioInitializedRef.current) {
      try {
        // Try to initialize Web Audio API
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
          isAudioInitializedRef.current = true;
          console.log('✅ Web Audio API initialized successfully');
        } else {
          console.warn('❌ Web Audio API not supported');
        }
      } catch (error) {
        console.warn('❌ Error initializing Web Audio API:', error);
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [enableSound]);

  // Create beep sound using Web Audio API
  const createBeep = useCallback((frequency: number = 800, duration: number = 200, volume: number = 0.3) => {
    if (!enableSound || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = volume;
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
      
      console.log(`🔊 Playing beep: ${frequency}Hz, ${duration}ms, volume: ${volume}`);
    } catch (error) {
      console.error('❌ Error creating beep:', error);
    }
  }, [enableSound]);

  // Play alert sound with multiple fallback strategies
  const playAlertSound = useCallback((type: 'down' | 'recovery' | 'warning' = 'down') => {
    if (!enableSound) {
      console.log('🔇 Sound is disabled');
      return;
    }

    if (!audioContextRef.current) {
      console.warn('❌ Audio context not initialized');
      return;
    }

    try {
      switch (type) {
        case 'down':
          // Critical alert - loud, immediate
          createBeep(1000, 300, 0.5); // Lower frequency, longer duration, louder
          setTimeout(() => createBeep(800, 200, 0.4), 100); // Double beep
          break;
          
        case 'recovery':
          // Recovery - pleasant, ascending tone
          createBeep(600, 150, 0.2); // Gentle, short
          setTimeout(() => createBeep(800, 150, 0.3), 200); // Ascending
          break;
          
        case 'warning':
          // Warning - attention-grabbing
          createBeep(1200, 100, 0.4); // High pitch, short
          setTimeout(() => createBeep(1200, 100, 0.4), 150); // Double beep
          break;
          
        default:
          createBeep(800, 200, 0.3);
          break;
      }
    } catch (error) {
      console.error('❌ Error playing alert sound:', error);
    }
  }, [enableSound, createBeep]);

  // Fallback method: System notification beep
  const playSystemBeep = useCallback(() => {
    try {
      // Try to use the Web Audio API for system beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.5;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('🔊 System beep played via Web Audio API');
    } catch (error) {
      console.error('❌ System beep failed:', error);
    }
  }, []);

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
      });

      // Play alert sound - critical alert
      playAlertSound('down');

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

      // Play recovery sound - softer sound
      playAlertSound('recovery');

      // Update browser title
      updateBrowserTitle(Math.max(0, activeAlerts.size - 1));

      console.log(`✅ RECOVERY: ${apiName} changed from ${prevStatus} to ${currentStatus}`);
    }

    // Alert on slow response (warning)
    if (prevStatus !== 'slow' && currentStatus === 'slow') {
      // Show warning toast
      toast(`⚠️ ${apiName} is SLOW`, {
        duration: 4000,
        icon: '🟡',
        style: {
          borderLeft: '4px solid #f59e0b',
          paddingLeft: '16px',
          background: '#fef3c7',
          color: '#92400e',
        },
      });

      // Play warning sound
      playAlertSound('warning');

      console.log(`⚠️ WARNING: ${apiName} changed from ${prevStatus} to ${currentStatus}`);
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
    const originalTitle = originalTitleRef.current;
    return () => {
      if (enableBrowserTitle) {
        document.title = originalTitle;
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
    playSystemBeep, // Expose for testing
  };
};
