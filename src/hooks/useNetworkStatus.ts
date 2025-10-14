import { useState, useEffect, useCallback } from 'react';
import { NetworkUtils, NetworkState } from '@/utils/networkUtils';
import { AnalyticsService } from '@/services/analytics/analyticsService';

export interface UseNetworkStatusReturn {
  // Network state
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: string;
  isWifiEnabled?: boolean;
  
  // Connection quality
  connectionQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  downloadSpeed?: number;
  latency?: number;
  
  // Utilities
  isOnline: boolean;
  isOffline: boolean;
  isWifi: boolean;
  isCellular: boolean;
  
  // Actions
  checkConnection: () => Promise<boolean>;
  testSpeed: () => Promise<{ downloadSpeed: number; latency: number }>;
  waitForConnection: (timeout?: number) => Promise<boolean>;
  
  // Callbacks
  onConnectionChange: (callback: (isConnected: boolean) => void) => () => void;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });
  
  const [connectionQuality, setConnectionQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>();
  const [downloadSpeed, setDownloadSpeed] = useState<number>();
  const [latency, setLatency] = useState<number>();

  // Derived values
  const isOnline = networkState.isConnected && networkState.isInternetReachable;
  const isOffline = !isOnline;
  const isWifi = networkState.type === 'wifi';
  const isCellular = networkState.type === 'cellular';

  // Check connection
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const isConnected = await NetworkUtils.isConnected();
      return isConnected;
    } catch (error) {
      console.error('Failed to check connection:', error);
      return false;
    }
  }, []);

  // Test connection speed
  const testSpeed = useCallback(async (): Promise<{ downloadSpeed: number; latency: number }> => {
    try {
      const result = await NetworkUtils.testInternetSpeed();
      setDownloadSpeed(result.downloadSpeed);
      setLatency(result.latency);
      setConnectionQuality(NetworkUtils.getConnectionQuality(result.downloadSpeed));
      
      // Track analytics
      AnalyticsService.trackEvent('network_speed_test', {
        download_speed: result.downloadSpeed,
        latency: result.latency,
        connection_type: networkState.type,
        quality: NetworkUtils.getConnectionQuality(result.downloadSpeed),
      });
      
      return result;
    } catch (error) {
      console.error('Failed to test speed:', error);
      throw error;
    }
  }, [networkState.type]);

  // Wait for connection
  const waitForConnection = useCallback(async (timeout: number = 10000): Promise<boolean> => {
    try {
      return await NetworkUtils.waitForConnection(timeout);
    } catch (error) {
      console.error('Failed to wait for connection:', error);
      return false;
    }
  }, []);

  // Subscribe to connection changes
  const onConnectionChange = useCallback((callback: (isConnected: boolean) => void) => {
    let isSubscribed = true;
    
    const unsubscribe = NetworkUtils.subscribeToNetworkState((state) => {
      if (isSubscribed) {
        const isConnected = state.isConnected && state.isInternetReachable;
        callback(isConnected);
      }
    });
    
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // Handle network state changes
  const handleNetworkStateChange = useCallback((state: NetworkState) => {
    const wasConnected = networkState.isConnected && networkState.isInternetReachable;
    const isConnected = state.isConnected && state.isInternetReachable;
    
    setNetworkState(state);
    
    // Track connection changes
    if (wasConnected !== isConnected) {
      AnalyticsService.onNetworkStateChange(isConnected);
      
      if (isConnected) {
        console.log('🌐 Internet connection restored');
      } else {
        console.log('📵 Internet connection lost');
      }
    }
    
    // Auto-test speed on WiFi connection
    if (isConnected && state.type === 'wifi' && networkState.type !== 'wifi') {
      setTimeout(() => {
        testSpeed().catch(console.error);
      }, 2000); // Wait 2 seconds for connection to stabilize
    }
  }, [networkState, testSpeed]);

  // Initialize network monitoring
  useEffect(() => {
    let mounted = true;
    
    // Get initial network state
    NetworkUtils.getNetworkState().then((state) => {
      if (mounted) {
        setNetworkState(state);
      }
    });
    
    // Subscribe to network changes
    const unsubscribe = NetworkUtils.subscribeToNetworkState((state) => {
      if (mounted) {
        handleNetworkStateChange(state);
      }
    });
    
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [handleNetworkStateChange]);

  // Periodic connection quality check for WiFi
  useEffect(() => {
    if (!isWifi || !isOnline) return;
    
    const interval = setInterval(() => {
      testSpeed().catch(() => {
        // Ignore errors in background speed tests
      });
    }, 5 * 60 * 1000); // Test every 5 minutes on WiFi
    
    return () => clearInterval(interval);
  }, [isWifi, isOnline, testSpeed]);

  return {
    // Network state
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    connectionType: networkState.type,
    isWifiEnabled: networkState.isWifiEnabled,
    
    // Connection quality
    connectionQuality,
    downloadSpeed,
    latency,
    
    // Utilities
    isOnline,
    isOffline,
    isWifi,
    isCellular,
    
    // Actions
    checkConnection,
    testSpeed,
    waitForConnection,
    
    // Callbacks
    onConnectionChange,
  };
};

export default useNetworkStatus;