/**
 * Performance Optimization Utilities
 */

import { Platform, InteractionManager } from 'react-native';
import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Run after interactions (for heavy operations)
 */
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef(throttle(callback, delay));

  useEffect(() => {
    throttledCallback.current = throttle(callback, delay);
  }, [callback, delay]);

  return useCallback(
    (...args: Parameters<T>) => throttledCallback.current(...args),
    []
  ) as T;
}

/**
 * Memoize expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Lazy load component
 */
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(importFunc());
      }, 0);
    });
  });
};

/**
 * Check if should use native driver
 */
export const shouldUseNativeDriver = (): boolean => {
  return Platform.OS !== 'web';
};

/**
 * Optimize images for platform
 */
export const getOptimizedImageUri = (uri: string, width?: number, height?: number): string => {
  if (!uri) return '';

  // Add resize parameters for remote images
  if (uri.startsWith('http')) {
    const params = [];
    if (width) params.push(`w=${Math.round(width)}`);
    if (height) params.push(`h=${Math.round(height)}`);

    if (params.length > 0) {
      const separator = uri.includes('?') ? '&' : '?';
      return `${uri}${separator}${params.join('&')}`;
    }
  }

  return uri;
};

/**
 * Batch state updates
 */
export const batchUpdates = (callback: () => void): void => {
  if (Platform.OS === 'web') {
    // Use React 18's automatic batching
    callback();
  } else {
    // For React Native, wrap in setTimeout
    setTimeout(callback, 0);
  }
};

/**
 * Check if low-end device
 */
export const isLowEndDevice = (): boolean => {
  // This is a simplified check
  // In production, use react-native-device-info
  return Platform.OS === 'android' && Platform.Version < 29;
};

/**
 * Get optimal chunk size for lists
 */
export const getOptimalChunkSize = (): number => {
  if (isLowEndDevice()) {
    return 10;
  }
  return 20;
};

/**
 * Optimize FlatList props
 */
export const getOptimizedFlatListProps = () => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: getOptimalChunkSize(),
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 10,
  windowSize: 10,
  getItemLayout: (data: any, index: number) => ({
    length: 70, // Average item height
    offset: 70 * index,
    index,
  }),
});

/**
 * Optimize ScrollView
 */
export const getOptimizedScrollViewProps = () => ({
  scrollEventThrottle: 16,
  removeClippedSubviews: Platform.OS === 'android',
});

/**
 * Reduce animation frames for low-end devices
 */
export const getAnimationConfig = () => ({
  duration: isLowEndDevice() ? 200 : 300,
  useNativeDriver: shouldUseNativeDriver(),
});

/**
 * Cache with TTL
 */
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  private ttl: number;

  constructor(ttlMs: number) {
    this.ttl = ttlMs;
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);

    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Request Animation Frame wrapper
 */
export const requestAnimationFrame = (callback: () => void): number => {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16) as any;
};

/**
 * Cancel Animation Frame wrapper
 */
export const cancelAnimationFrame = (id: number): void => {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
};

export default {
  debounce,
  throttle,
  runAfterInteractions,
  memoize,
  lazyLoad,
  shouldUseNativeDriver,
  getOptimizedImageUri,
  batchUpdates,
  isLowEndDevice,
  getOptimalChunkSize,
  getOptimizedFlatListProps,
  getOptimizedScrollViewProps,
  getAnimationConfig,
  TTLCache,
  requestAnimationFrame,
  cancelAnimationFrame,
};
