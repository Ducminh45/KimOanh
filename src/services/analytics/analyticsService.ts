import { Analytics } from '@/utils/analytics';
import { Config } from '@/constants/config';
import { NetworkUtils } from '@/utils/networkUtils';
import { StorageService } from '../storage/storageService';

export interface AnalyticsConfig {
  enabled: boolean;
  userId?: string;
  sessionId?: string;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
  appInfo: {
    version: string;
    buildNumber?: string;
  };
}

export interface CustomEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp?: Date;
}

export class AnalyticsService {
  private static config: AnalyticsConfig = {
    enabled: true,
    deviceInfo: {
      platform: 'mobile',
      version: '1.0.0',
    },
    appInfo: {
      version: Config.APP_VERSION,
    },
  };

  private static eventQueue: CustomEvent[] = [];
  private static isInitialized = false;

  /**
   * Initialize analytics service
   */
  static async initialize(config?: Partial<AnalyticsConfig>): Promise<void> {
    try {
      // Merge with default config
      this.config = { ...this.config, ...config };

      // Load stored analytics preferences
      const storedPreferences = await StorageService.getItem<{
        enabled: boolean;
        userId?: string;
      }>('analytics_preferences');

      if (storedPreferences) {
        this.config.enabled = storedPreferences.enabled;
        this.config.userId = storedPreferences.userId;
      }

      // Initialize the base analytics utility
      Analytics.initialize();

      // Set user ID if available
      if (this.config.userId) {
        Analytics.setUserId(this.config.userId);
      }

      // Process queued events
      await this.processEventQueue();

      this.isInitialized = true;

      // Track initialization
      this.trackEvent('analytics_initialized', {
        enabled: this.config.enabled,
        platform: this.config.deviceInfo.platform,
        app_version: this.config.appInfo.version,
      });

      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  /**
   * Enable or disable analytics
   */
  static async setEnabled(enabled: boolean): Promise<void> {
    this.config.enabled = enabled;

    // Store preference
    await StorageService.setItem('analytics_preferences', {
      enabled,
      userId: this.config.userId,
    });

    this.trackEvent('analytics_settings_changed', { enabled });
  }

  /**
   * Set user ID for analytics
   */
  static async setUserId(userId: string): Promise<void> {
    this.config.userId = userId;
    Analytics.setUserId(userId);

    // Store preference
    await StorageService.setItem('analytics_preferences', {
      enabled: this.config.enabled,
      userId,
    });
  }

  /**
   * Set user properties
   */
  static setUserProperties(properties: Record<string, any>): void {
    if (!this.config.enabled) return;

    Analytics.setUserProperties({
      userId: this.config.userId || '',
      ...properties,
    });
  }

  /**
   * Track custom event
   */
  static trackEvent(name: string, parameters?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const event: CustomEvent = {
      name,
      parameters: {
        ...parameters,
        platform: this.config.deviceInfo.platform,
        app_version: this.config.appInfo.version,
        user_id: this.config.userId,
      },
      timestamp: new Date(),
    };

    if (this.isInitialized) {
      Analytics.trackEvent(event.name, event.parameters);
    } else {
      // Queue event if not initialized yet
      this.eventQueue.push(event);
    }
  }

  /**
   * Track screen view
   */
  static trackScreenView(screenName: string, screenClass?: string): void {
    if (!this.config.enabled) return;

    Analytics.trackScreenView(screenName, screenClass);
  }

  /**
   * Track user action
   */
  static trackUserAction(
    action: string,
    category: string,
    label?: string,
    value?: number
  ): void {
    if (!this.config.enabled) return;

    Analytics.trackUserAction(action, category, label, value);
  }

  // Food & Nutrition Analytics
  static trackFoodScan(success: boolean, confidence?: number, foodType?: string): void {
    Analytics.trackFoodScan(success, confidence, foodType);
  }

  static trackFoodLog(mealType: string, calories: number, source: 'scan' | 'manual'): void {
    Analytics.trackFoodLog(mealType, calories, source);
  }

  static trackNutritionGoalComplete(goalType: 'calories' | 'water' | 'exercise'): void {
    Analytics.trackDailyGoalComplete(goalType);
  }

  // Exercise Analytics
  static trackExercise(
    type: string,
    duration: number,
    intensity: string,
    caloriesBurned: number
  ): void {
    Analytics.trackExercise(type, duration, intensity, caloriesBurned);
  }

  // Water Tracking Analytics
  static trackWaterIntake(amount: number, totalDaily: number): void {
    Analytics.trackWaterIntake(amount, totalDaily);
  }

  // Weight Tracking Analytics
  static trackWeightLog(weight: number, bmi: number): void {
    Analytics.trackWeightLog(weight, bmi);
  }

  // AI Chatbot Analytics
  static trackChatbotInteraction(messageType: 'question' | 'advice_request', topic?: string): void {
    Analytics.trackChatbotInteraction(messageType, topic);
  }

  static trackChatbotResponse(responseTime: number, helpful: boolean): void {
    Analytics.trackChatbotResponse(responseTime, helpful);
  }

  // Premium Features Analytics
  static trackPremiumFeatureUsed(feature: string): void {
    Analytics.trackPremiumFeatureUsed(feature);
  }

  static trackSubscriptionPurchase(plan: string, price: number): void {
    Analytics.trackSubscriptionPurchase(plan, price);
  }

  static trackSubscriptionCancel(plan: string, reason?: string): void {
    Analytics.trackSubscriptionCancel(plan, reason);
  }

  // Social Features Analytics
  static trackSocialShare(contentType: string, platform: string): void {
    Analytics.trackSocialShare(contentType, platform);
  }

  static trackCommunityPost(postType: string, hasImage: boolean): void {
    Analytics.trackCommunityPost(postType, hasImage);
  }

  // Meal Planning Analytics
  static trackMealPlanGeneration(planType: string, duration: number): void {
    Analytics.trackMealPlanGeneration(planType, duration);
  }

  static trackRecipeView(recipeId: string, recipeName: string): void {
    Analytics.trackRecipeView(recipeId, recipeName);
  }

  // Error Analytics
  static trackError(errorCode: string, errorMessage: string, context?: string): void {
    Analytics.trackError(errorCode, errorMessage, context);
  }

  static trackCrash(error: Error, context?: string): void {
    Analytics.trackCrash(error, context);
  }

  // Performance Analytics
  static trackPerformance(metric: string, value: number, unit: string): void {
    Analytics.trackPerformance(metric, value, unit);
  }

  static trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    Analytics.trackApiCall(endpoint, method, duration, status);
  }

  // User Engagement Analytics
  static trackSessionStart(): void {
    Analytics.trackSessionStart();
  }

  static trackSessionEnd(duration: number): void {
    Analytics.trackSessionEnd(duration);
  }

  static trackFeatureDiscovery(feature: string, source: string): void {
    Analytics.trackFeatureDiscovery(feature, source);
  }

  static trackTutorialStep(step: number, completed: boolean): void {
    Analytics.trackTutorialStep(step, completed);
  }

  // Settings Analytics
  static trackSettingsChange(setting: string, oldValue: any, newValue: any): void {
    Analytics.trackSettingsChange(setting, oldValue, newValue);
  }

  /**
   * Process queued events
   */
  private static async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      // Process all queued events
      for (const event of this.eventQueue) {
        Analytics.trackEvent(event.name, event.parameters);
      }

      // Clear the queue
      this.eventQueue = [];
    } catch (error) {
      console.error('Failed to process analytics event queue:', error);
    }
  }

  /**
   * Flush events to analytics service
   */
  static async flush(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      await Analytics.flushEvents();
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
    }
  }

  /**
   * Get analytics configuration
   */
  static getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Check if analytics is enabled
   */
  static isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get stored events for debugging
   */
  static getStoredEvents(): any[] {
    return Analytics.getEvents();
  }

  /**
   * Clear all stored events
   */
  static clearStoredEvents(): void {
    Analytics.clearEvents();
  }

  /**
   * Handle app state changes
   */
  static onAppStateChange(state: 'active' | 'background' | 'inactive'): void {
    if (!this.config.enabled) return;

    switch (state) {
      case 'active':
        Analytics.onAppForeground();
        this.trackEvent('app_foreground');
        break;
      case 'background':
        Analytics.onAppBackground();
        this.trackEvent('app_background');
        this.flush(); // Flush events when app goes to background
        break;
      case 'inactive':
        this.trackEvent('app_inactive');
        break;
    }
  }

  /**
   * Handle network state changes
   */
  static async onNetworkStateChange(isConnected: boolean): Promise<void> {
    if (!this.config.enabled) return;

    this.trackEvent('network_state_change', {
      is_connected: isConnected,
    });

    // Try to flush events when network becomes available
    if (isConnected) {
      await this.flush();
    }
  }

  /**
   * Track app installation and first launch
   */
  static async trackAppInstall(): Promise<void> {
    const hasTrackedInstall = await StorageService.getItem<boolean>('analytics_install_tracked');
    
    if (!hasTrackedInstall) {
      this.trackEvent('app_install', {
        install_date: new Date().toISOString(),
        platform: this.config.deviceInfo.platform,
        app_version: this.config.appInfo.version,
      });

      await StorageService.setItem('analytics_install_tracked', true);
    }
  }

  /**
   * Track app update
   */
  static async trackAppUpdate(): Promise<void> {
    const lastTrackedVersion = await StorageService.getItem<string>('analytics_last_version');
    const currentVersion = this.config.appInfo.version;

    if (lastTrackedVersion && lastTrackedVersion !== currentVersion) {
      this.trackEvent('app_update', {
        old_version: lastTrackedVersion,
        new_version: currentVersion,
        update_date: new Date().toISOString(),
      });
    }

    await StorageService.setItem('analytics_last_version', currentVersion);
  }

  /**
   * Generate analytics report
   */
  static generateReport(): {
    totalEvents: number;
    sessionInfo: any;
    userInfo: any;
    deviceInfo: any;
  } {
    return {
      totalEvents: Analytics.getEvents().length,
      sessionInfo: {
        sessionId: Analytics.getSessionId(),
        userId: Analytics.getUserId(),
      },
      userInfo: Analytics.getUserProperties(),
      deviceInfo: this.config.deviceInfo,
    };
  }
}

export default AnalyticsService;