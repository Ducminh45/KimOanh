/**
 * Performance Monitoring Service
 */

import { InteractionManager, Platform } from 'react-native';

interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private metrics: Map<string, number[]> = new Map();

  /**
   * Start measuring performance
   */
  start(name: string, metadata?: Record<string, any>): void {
    this.marks.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * End measuring and record duration
   */
  end(name: string): number | null {
    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - mark.startTime;

    mark.endTime = endTime;
    mark.duration = duration;

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    // Log in development
    if (__DEV__) {
      console.log(`⏱️ ${name}: ${duration}ms`, mark.metadata);
    }

    // Clean up
    this.marks.delete(name);

    return duration;
  }

  /**
   * Get average duration for a metric
   */
  getAverage(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, { count: number; average: number; min: number; max: number }> {
    const result: Record<string, any> = {};

    this.metrics.forEach((values, name) => {
      result[name] = {
        count: values.length,
        average: this.getAverage(name),
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return result;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.marks.clear();
    this.metrics.clear();
  }

  /**
   * Measure async function
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure component render
   */
  measureRender(componentName: string): () => void {
    const markName = `render:${componentName}`;
    this.start(markName);

    return () => {
      InteractionManager.runAfterInteractions(() => {
        this.end(markName);
      });
    };
  }

  /**
   * Track screen load time
   */
  trackScreenLoad(screenName: string): () => void {
    const markName = `screen:${screenName}`;
    this.start(markName);

    return () => {
      InteractionManager.runAfterInteractions(() => {
        const duration = this.end(markName);
        
        // Log slow screens
        if (duration && duration > 1000) {
          console.warn(`⚠️ Slow screen load: ${screenName} took ${duration}ms`);
        }
      });
    };
  }

  /**
   * Monitor app startup
   */
  trackAppStartup(): void {
    this.start('app:startup');
  }

  /**
   * End app startup tracking
   */
  endAppStartup(): void {
    const duration = this.end('app:startup');
    
    if (duration) {
      console.log(`🚀 App started in ${duration}ms`);
      
      // Send to analytics
      if (duration > 3000) {
        console.warn('⚠️ Slow app startup detected');
      }
    }
  }

  /**
   * Track API call duration
   */
  async trackAPICall<T>(
    endpoint: string,
    method: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const markName = `api:${method}:${endpoint}`;
    return this.measure(markName, fn);
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const metrics = this.getAllMetrics();
    let report = '\n📊 Performance Report\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    Object.entries(metrics).forEach(([name, data]) => {
      report += `${name}:\n`;
      report += `  Count: ${data.count}\n`;
      report += `  Average: ${data.average.toFixed(2)}ms\n`;
      report += `  Min: ${data.min.toFixed(2)}ms\n`;
      report += `  Max: ${data.max.toFixed(2)}ms\n\n`;
    });

    return report;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC to measure component performance
 */
export function withPerformanceTracking<P>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || Component.displayName || Component.name || 'Component';

  return (props: P) => {
    const endMeasure = performanceMonitor.measureRender(name);

    React.useEffect(() => {
      endMeasure();
    }, []);

    return <Component {...props} />;
  };
}

/**
 * Hook to track screen load
 */
export function useScreenTracking(screenName: string): void {
  React.useEffect(() => {
    const endTracking = performanceMonitor.trackScreenLoad(screenName);
    return () => endTracking();
  }, [screenName]);
}

/**
 * Measure bundle size
 */
export const getBundleSize = (): string => {
  // This is a placeholder - actual implementation requires native modules
  return Platform.select({
    ios: 'iOS bundle size tracking requires native implementation',
    android: 'Android bundle size tracking requires native implementation',
  }) || 'Unknown';
};

export default performanceMonitor;
