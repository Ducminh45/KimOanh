import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled?: boolean;
}

export class NetworkUtils {
  private static listeners: Array<(state: NetworkState) => void> = [];

  static async getNetworkState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      isWifiEnabled: state.isWifiEnabled,
    };
  }

  static async isConnected(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.isConnected && state.isInternetReachable;
  }

  static async isWifiConnected(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.isConnected && state.type === 'wifi';
  }

  static async isCellularConnected(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.isConnected && state.type === 'cellular';
  }

  static subscribeToNetworkState(callback: (state: NetworkState) => void): () => void {
    this.listeners.push(callback);

    const unsubscribe = NetInfo.addEventListener((state) => {
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifiEnabled: state.isWifiEnabled,
      };

      this.listeners.forEach((listener) => listener(networkState));
    });

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
      unsubscribe();
    };
  }

  static async waitForConnection(timeout: number = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout;
      
      const checkConnection = async () => {
        const isConnected = await this.isConnected();
        if (isConnected) {
          clearTimeout(timeoutId);
          resolve(true);
        }
      };

      // Check immediately
      checkConnection();

      // Set up timeout
      timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      // Listen for network changes
      const unsubscribe = this.subscribeToNetworkState(async (state) => {
        if (state.isConnected && state.isInternetReachable) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check if we have internet connection before attempting
        const isConnected = await this.isConnected();
        if (!isConnected) {
          throw new Error('No internet connection');
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async testInternetSpeed(): Promise<{
    downloadSpeed: number; // Mbps
    latency: number; // ms
  }> {
    const startTime = Date.now();
    const testUrl = 'https://httpbin.org/bytes/1048576'; // 1MB test file

    try {
      const response = await fetch(testUrl);
      const endTime = Date.now();
      
      if (!response.ok) {
        throw new Error('Speed test failed');
      }

      const latency = endTime - startTime;
      const bytes = 1048576; // 1MB in bytes
      const seconds = latency / 1000;
      const bitsPerSecond = (bytes * 8) / seconds;
      const mbps = bitsPerSecond / (1024 * 1024);

      return {
        downloadSpeed: Math.round(mbps * 100) / 100,
        latency,
      };
    } catch (error) {
      throw new Error('Unable to test internet speed');
    }
  }

  static getConnectionQuality(downloadSpeed: number): 'poor' | 'fair' | 'good' | 'excellent' {
    if (downloadSpeed < 1) return 'poor';
    if (downloadSpeed < 5) return 'fair';
    if (downloadSpeed < 25) return 'good';
    return 'excellent';
  }

  static shouldUseHighQualityImages(): Promise<boolean> {
    return this.isWifiConnected();
  }

  static async shouldAllowLargeDownloads(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.type === 'wifi' || state.type === 'ethernet';
  }

  static formatConnectionType(type: string): string {
    const types: Record<string, string> = {
      wifi: 'Wi-Fi',
      cellular: 'Di động',
      ethernet: 'Ethernet',
      bluetooth: 'Bluetooth',
      wimax: 'WiMAX',
      vpn: 'VPN',
      other: 'Khác',
      unknown: 'Không xác định',
      none: 'Không có kết nối',
    };

    return types[type.toLowerCase()] || type;
  }

  static async getNetworkInfo(): Promise<{
    type: string;
    isConnected: boolean;
    isInternetReachable: boolean;
    connectionQuality?: 'poor' | 'fair' | 'good' | 'excellent';
    downloadSpeed?: number;
    latency?: number;
  }> {
    const state = await this.getNetworkState();
    
    if (!state.isConnected) {
      return {
        type: state.type,
        isConnected: false,
        isInternetReachable: false,
      };
    }

    try {
      const speedTest = await this.testInternetSpeed();
      return {
        ...state,
        connectionQuality: this.getConnectionQuality(speedTest.downloadSpeed),
        downloadSpeed: speedTest.downloadSpeed,
        latency: speedTest.latency,
      };
    } catch (error) {
      return state;
    }
  }

  static createOfflineQueue<T>() {
    const queue: Array<() => Promise<T>> = [];
    let isProcessing = false;

    const addToQueue = (operation: () => Promise<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            const result = await operation();
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        });

        if (!isProcessing) {
          processQueue();
        }
      });
    };

    const processQueue = async () => {
      if (isProcessing || queue.length === 0) return;

      isProcessing = true;

      while (queue.length > 0) {
        const isConnected = await this.isConnected();
        
        if (!isConnected) {
          // Wait for connection
          await this.waitForConnection();
        }

        const operation = queue.shift();
        if (operation) {
          try {
            await operation();
          } catch (error) {
            console.error('Queue operation failed:', error);
            // Re-add to queue for retry
            queue.unshift(operation);
            await this.delay(5000); // Wait 5 seconds before retry
          }
        }
      }

      isProcessing = false;
    };

    return { addToQueue, processQueue };
  }

  static async pingServer(url: string, timeout: number = 5000): Promise<number> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return Date.now() - startTime;
    } catch (error) {
      throw new Error('Server unreachable');
    }
  }

  static async isServerReachable(url: string): Promise<boolean> {
    try {
      await this.pingServer(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  static getOptimalImageQuality(): Promise<number> {
    return new Promise(async (resolve) => {
      const isWifi = await this.isWifiConnected();
      
      if (isWifi) {
        resolve(0.9); // High quality on Wi-Fi
      } else {
        try {
          const speedTest = await this.testInternetSpeed();
          const quality = this.getConnectionQuality(speedTest.downloadSpeed);
          
          switch (quality) {
            case 'excellent':
              resolve(0.9);
              break;
            case 'good':
              resolve(0.7);
              break;
            case 'fair':
              resolve(0.5);
              break;
            default:
              resolve(0.3);
          }
        } catch (error) {
          resolve(0.5); // Default quality
        }
      }
    });
  }
}