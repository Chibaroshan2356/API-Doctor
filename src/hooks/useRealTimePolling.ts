import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRealTimePollingOptions {
  interval?: number; // Polling interval in milliseconds
  enabled?: boolean; // Whether polling is enabled
  onError?: (error: Error) => void; // Error callback
  onSuccess?: (data: any) => void; // Success callback
}

interface UseRealTimePollingReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  startPolling: () => void;
  stopPolling: () => void;
  refetch: () => Promise<void>;
}

export const useRealTimePolling = <T>(
  fetchFunction: () => Promise<T>,
  options: UseRealTimePollingOptions = {}
): UseRealTimePollingReturn<T> => {
  const {
    interval = 10000, // Default 10 seconds
    enabled = true,
    onError,
    onSuccess
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction, onError, onSuccess]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsPolling(true);
    
    // Initial fetch
    fetchData();

    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && !isPolling) {
      startPolling();
    } else if (!enabled && isPolling) {
      stopPolling();
    }
  }, [enabled, isPolling, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    startPolling,
    stopPolling,
    refetch
  };
};

// WebSocket hook for real-time updates
interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  data: any;
  connected: boolean;
  error: string | null;
  reconnectAttempts: number;
  send: (data: any) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mountedRef.current) {
          setConnected(true);
          setError(null);
          setReconnectAttempts(0);
          onOpen?.();
        }
      };

      ws.onmessage = (event) => {
        if (mountedRef.current) {
          try {
            const parsedData = JSON.parse(event.data);
            setData(parsedData);
            onMessage?.(parsedData);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        }
      };

      ws.onerror = (event) => {
        if (mountedRef.current) {
          setError('WebSocket error occurred');
          onError?.(event);
        }
      };

      ws.onclose = (event) => {
        if (mountedRef.current) {
          setConnected(false);
          onClose?.();

          // Attempt to reconnect if not explicitly closed
          if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connect();
            }, reconnectInterval);
          }
        }
      };
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to connect to WebSocket');
      }
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnectInterval, maxReconnectAttempts, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnected(false);
    setReconnectAttempts(0);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    connect();
  }, [disconnect, connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  // Initial connection
  useEffect(() => {
    connect();
  }, [connect]);

  return {
    data,
    connected,
    error,
    reconnectAttempts,
    send,
    disconnect,
    reconnect
  };
};
