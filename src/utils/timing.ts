export class Timer {
  private startTime: number = 0;
  private endTime: number = 0;
  private isRunning: boolean = false;

  start(): void {
    this.startTime = Date.now();
    this.isRunning = true;
    this.endTime = 0;
  }

  stop(): number {
    if (!this.isRunning) {
      throw new Error('Timer is not running');
    }

    this.endTime = Date.now();
    this.isRunning = false;
    return this.getDuration();
  }

  getDuration(): number {
    if (this.isRunning) {
      return Date.now() - this.startTime;
    }

    if (this.endTime === 0) {
      return 0;
    }

    return this.endTime - this.startTime;
  }

  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
    this.isRunning = false;
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export class PerformanceTimer {
  private static timers: Map<string, Timer> = new Map();

  static start(name: string): void {
    const timer = new Timer();
    timer.start();
    this.timers.set(name, timer);
  }

  static stop(name: string): number {
    const timer = this.timers.get(name);
    if (!timer) {
      throw new Error(`Timer '${name}' not found`);
    }

    const duration = timer.stop();
    this.timers.delete(name);
    return duration;
  }

  static getDuration(name: string): number {
    const timer = this.timers.get(name);
    if (!timer) {
      return 0;
    }

    return timer.getDuration();
  }

  static measure<T>(name: string, fn: () => T): T;
  static measure<T>(name: string, fn: () => Promise<T>): Promise<T>;
  static measure<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(name);
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = this.stop(name);
          if (__DEV__) {
            console.log(`⏱️ ${name}: ${duration}ms`);
          }
        });
      } else {
        const duration = this.stop(name);
        if (__DEV__) {
          console.log(`⏱️ ${name}: ${duration}ms`);
        }
        return result;
      }
    } catch (error) {
      this.stop(name);
      throw error;
    }
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    
    try {
      const result = await fn();
      const duration = this.stop(name);
      
      if (__DEV__) {
        console.log(`⏱️ ${name}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      this.stop(name);
      throw error;
    }
  }

  static clearAll(): void {
    this.timers.clear();
  }
}

export class Debouncer {
  private timeoutId: NodeJS.Timeout | null = null;

  debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export class Throttler {
  private lastCallTime: number = 0;
  private timeoutId: NodeJS.Timeout | null = null;

  throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - this.lastCallTime >= delay) {
        this.lastCallTime = now;
        func(...args);
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => {
          this.lastCallTime = Date.now();
          this.timeoutId = null;
          func(...args);
        }, delay - (now - this.lastCallTime));
      }
    };
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export class IntervalManager {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  setInterval(name: string, callback: () => void, delay: number): void {
    this.clearInterval(name);
    const intervalId = setInterval(callback, delay);
    this.intervals.set(name, intervalId);
  }

  clearInterval(name: string): void {
    const intervalId = this.intervals.get(name);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(name);
    }
  }

  clearAll(): void {
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
  }

  hasInterval(name: string): boolean {
    return this.intervals.has(name);
  }
}

export class TimeoutManager {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  setTimeout(name: string, callback: () => void, delay: number): void {
    this.clearTimeout(name);
    const timeoutId = setTimeout(() => {
      this.timeouts.delete(name);
      callback();
    }, delay);
    this.timeouts.set(name, timeoutId);
  }

  clearTimeout(name: string): void {
    const timeoutId = this.timeouts.get(name);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(name);
    }
  }

  clearAll(): void {
    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }

  hasTimeout(name: string): boolean {
    return this.timeouts.has(name);
  }
}

export class AnimationFrame {
  private requestId: number | null = null;

  request(callback: () => void): void {
    this.cancel();
    this.requestId = requestAnimationFrame(callback);
  }

  cancel(): void {
    if (this.requestId !== null) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }
}

export class CountdownTimer {
  private timer: Timer = new Timer();
  private duration: number = 0;
  private onTick?: (remaining: number) => void;
  private onComplete?: () => void;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    duration: number,
    onTick?: (remaining: number) => void,
    onComplete?: () => void
  ) {
    this.duration = duration;
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start(): void {
    this.timer.start();
    
    this.intervalId = setInterval(() => {
      const elapsed = this.timer.getDuration();
      const remaining = Math.max(0, this.duration - elapsed);

      if (this.onTick) {
        this.onTick(remaining);
      }

      if (remaining <= 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 100); // Update every 100ms for smooth countdown
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.timer.reset();
  }

  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    if (!this.intervalId && this.timer.isActive()) {
      this.start();
    }
  }

  getRemaining(): number {
    const elapsed = this.timer.getDuration();
    return Math.max(0, this.duration - elapsed);
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

export class StopWatch {
  private timer: Timer = new Timer();
  private laps: number[] = [];
  private onTick?: (elapsed: number) => void;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(onTick?: (elapsed: number) => void) {
    this.onTick = onTick;
  }

  start(): void {
    this.timer.start();
    
    if (this.onTick) {
      this.intervalId = setInterval(() => {
        const elapsed = this.timer.getDuration();
        this.onTick!(elapsed);
      }, 100);
    }
  }

  stop(): number {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    return this.timer.stop();
  }

  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    if (!this.intervalId && this.timer.isActive() && this.onTick) {
      this.intervalId = setInterval(() => {
        const elapsed = this.timer.getDuration();
        this.onTick!(elapsed);
      }, 100);
    }
  }

  lap(): number {
    const lapTime = this.timer.getDuration();
    this.laps.push(lapTime);
    return lapTime;
  }

  getLaps(): number[] {
    return [...this.laps];
  }

  getElapsed(): number {
    return this.timer.getDuration();
  }

  reset(): void {
    this.stop();
    this.timer.reset();
    this.laps = [];
  }

  isRunning(): boolean {
    return this.timer.isActive();
  }
}

// Utility functions
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createDebouncer<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const debouncer = new Debouncer();
  return debouncer.debounce(func, delay);
}

export function createThrottler<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const throttler = new Throttler();
  return throttler.throttle(func, delay);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `0:${seconds.toString().padStart(2, '0')}`;
  }
}

export function formatMilliseconds(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)}m`;
  }
  
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}