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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio with multiple fallback options
  useEffect(() => {
    if (enableSound) {
      try {
        // Try different audio sources for better compatibility
        const audioSources = [
          // Option 1: Custom sound URL if provided
          customSoundUrl,
          // Option 2: Simple beep (shorter, more compatible)
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
          // Option 3: Even simpler beep
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
          // Option 4: Web Audio API generated beep
          null
        ];

        // Try each audio source until one works
        for (const source of audioSources) {
          if (source === null) {
            // Create Web Audio API beep as last resort
            audioRef.current = createWebAudioBeep();
            break;
          }

          try {
            const audio = new Audio(source);
            audio.volume = 0.3;
            audio.preload = 'auto';
            
            // Test if audio can be played
            const testPromise = audio.play();
            if (testPromise !== undefined) {
              testPromise
                .then(() => {
                  audio.pause();
                  audio.currentTime = 0;
                  audioRef.current = audio;
                  console.log('✅ Audio source loaded:', source ? 'Base64 audio' : 'Web Audio API');
                  break;
                })
                .catch(() => {
                  console.warn('❌ Audio source failed:', source ? 'Base64 audio' : 'Web Audio API');
                  // Try next source
                });
            } else {
              // Audio can be played (older browsers)
              audio.pause();
              audio.currentTime = 0;
              audioRef.current = audio;
              console.log('✅ Audio source loaded (legacy):', source ? 'Base64 audio' : 'Web Audio API');
              break;
            }
          } catch (error) {
            console.warn('❌ Error creating audio:', error);
            // Try next source
          }
        }
      } catch (error) {
        console.warn('❌ Error initializing audio system:', error);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [enableSound, customSoundUrl]);

  // Create Web Audio API beep as fallback
  const createWebAudioBeep = (): HTMLAudioElement | null => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800Hz beep
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      // Create a mock audio element with play method
      const mockAudio = {
        play: () => {
          try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            
            osc.start();
            osc.stop(audioContext.currentTime + 0.1); // 100ms beep
          } catch (error) {
            console.warn('Web Audio API playback failed:', error);
          }
        },
        currentTime: 0,
        volume: 0.3,
        pause: () => {},
        preload: 'auto'
      } as HTMLAudioElement;
      
      return mockAudio;
    } catch (error) {
      console.warn('Web Audio API not available:', error);
      return null;
    }
  };

  // Play alert sound with enhanced options
  const playAlertSound = useCallback((type: 'down' | 'recovery' | 'warning' = 'down') => {
    if (!enableSound || !audioRef.current) return;

    try {
      // Different sounds for different alert types
      if (type === 'down') {
        // Critical alert - play immediately
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          console.warn('Alert sound could not be played');
        });
      } else if (type === 'recovery') {
        // Recovery sound - softer, delayed
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.volume = 0.2; // Softer volume for recovery
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
              console.warn('Recovery sound could not be played');
            });
            // Reset volume
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.volume = 0.3;
              }
            }, 500);
          }
        }, 100);
      } else if (type === 'warning') {
        // Warning sound - play twice
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          console.warn('Warning sound could not be played');
        });
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
              console.warn('Warning sound could not be played');
            });
          }
        }, 200);
      }
    } catch (error) {
      console.warn('Error playing alert sound:', error);
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
  };
};
