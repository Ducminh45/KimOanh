export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId: string;
  age?: number;
  gender?: 'male' | 'female';
  isPremium: boolean;
  registrationDate: Date;
  lastActiveDate: Date;
  totalScans: number;
  totalWorkouts: number;
  preferredLanguage: string;
}

export class Analytics {
  private static events: AnalyticsEvent[] = [];
  private static sessionId: string = '';
  private static userId: string | null = null;
  private static userProperties: Partial<UserProperties> = {};

  static initialize(): void {
    this.sessionId = this.generateSessionId();
    
    // Track app launch
    this.trackEvent('app_launch', {
      platform: 'mobile',
      timestamp: new Date().toISOString(),
    });
  }

  static setUserId(userId: string): void {
    this.userId = userId;
  }

  static setUserProperties(properties: Partial<UserProperties>): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  static trackEvent(name: string, parameters?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name,
      parameters,
      timestamp: new Date(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.events.push(event);

    // In development, log to console
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }

    // In production, you would send to your analytics service
    this.sendToAnalyticsService(event);
  }

  static trackScreenView(screenName: string, screenClass?: string): void {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  static trackUserAction(action: string, category: string, label?: string, value?: number): void {
    this.trackEvent('user_action', {
      action,
      category,
      label,
      value,
    });
  }

  // Authentication Events
  static trackLogin(method: 'email' | 'google' | 'facebook'): void {
    this.trackEvent('login', { method });
  }

  static trackSignUp(method: 'email' | 'google' | 'facebook'): void {
    this.trackEvent('sign_up', { method });
  }

  static trackLogout(): void {
    this.trackEvent('logout');
  }

  // Food Scanning Events
  static trackFoodScan(success: boolean, confidence?: number, foodType?: string): void {
    this.trackEvent('food_scan', {
      success,
      confidence,
      food_type: foodType,
    });
  }

  static trackFoodScanResult(
    foodName: string,
    confidence: number,
    calories: number,
    scanDuration: number
  ): void {
    this.trackEvent('food_scan_result', {
      food_name: foodName,
      confidence,
      calories,
      scan_duration: scanDuration,
    });
  }

  static trackFoodLog(mealType: string, calories: number, source: 'scan' | 'manual'): void {
    this.trackEvent('food_log', {
      meal_type: mealType,
      calories,
      source,
    });
  }

  // Nutrition Tracking Events
  static trackDailyGoalComplete(goalType: 'calories' | 'water' | 'exercise'): void {
    this.trackEvent('daily_goal_complete', {
      goal_type: goalType,
    });
  }

  static trackWeightLog(weight: number, bmi: number): void {
    this.trackEvent('weight_log', {
      weight,
      bmi,
    });
  }

  static trackWaterIntake(amount: number, totalDaily: number): void {
    this.trackEvent('water_intake', {
      amount,
      total_daily: totalDaily,
    });
  }

  // Exercise Events
  static trackExercise(
    type: string,
    duration: number,
    intensity: string,
    caloriesBurned: number
  ): void {
    this.trackEvent('exercise_log', {
      exercise_type: type,
      duration,
      intensity,
      calories_burned: caloriesBurned,
    });
  }

  // AI Chatbot Events
  static trackChatbotInteraction(messageType: 'question' | 'advice_request', topic?: string): void {
    this.trackEvent('chatbot_interaction', {
      message_type: messageType,
      topic,
    });
  }

  static trackChatbotResponse(responseTime: number, helpful: boolean): void {
    this.trackEvent('chatbot_response', {
      response_time: responseTime,
      helpful,
    });
  }

  // Premium Features
  static trackPremiumFeatureUsed(feature: string): void {
    this.trackEvent('premium_feature_used', {
      feature,
    });
  }

  static trackSubscriptionPurchase(plan: string, price: number): void {
    this.trackEvent('subscription_purchase', {
      plan,
      price,
      currency: 'VND',
    });
  }

  static trackSubscriptionCancel(plan: string, reason?: string): void {
    this.trackEvent('subscription_cancel', {
      plan,
      reason,
    });
  }

  // Social Features
  static trackSocialShare(contentType: string, platform: string): void {
    this.trackEvent('social_share', {
      content_type: contentType,
      platform,
    });
  }

  static trackCommunityPost(postType: string, hasImage: boolean): void {
    this.trackEvent('community_post', {
      post_type: postType,
      has_image: hasImage,
    });
  }

  static trackChallengeParticipation(challengeId: string, challengeType: string): void {
    this.trackEvent('challenge_participation', {
      challenge_id: challengeId,
      challenge_type: challengeType,
    });
  }

  // Meal Planning
  static trackMealPlanGeneration(planType: string, duration: number): void {
    this.trackEvent('meal_plan_generation', {
      plan_type: planType,
      duration,
    });
  }

  static trackRecipeView(recipeId: string, recipeName: string): void {
    this.trackEvent('recipe_view', {
      recipe_id: recipeId,
      recipe_name: recipeName,
    });
  }

  static trackShoppingListGeneration(itemCount: number): void {
    this.trackEvent('shopping_list_generation', {
      item_count: itemCount,
    });
  }

  // Error Tracking
  static trackError(errorCode: string, errorMessage: string, context?: string): void {
    this.trackEvent('error', {
      error_code: errorCode,
      error_message: errorMessage,
      context,
    });
  }

  static trackCrash(error: Error, context?: string): void {
    this.trackEvent('crash', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  // Performance Tracking
  static trackPerformance(metric: string, value: number, unit: string): void {
    this.trackEvent('performance', {
      metric,
      value,
      unit,
    });
  }

  static trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      status,
    });
  }

  // User Engagement
  static trackSessionStart(): void {
    this.trackEvent('session_start', {
      session_id: this.sessionId,
    });
  }

  static trackSessionEnd(duration: number): void {
    this.trackEvent('session_end', {
      session_id: this.sessionId,
      duration,
    });
  }

  static trackFeatureDiscovery(feature: string, source: string): void {
    this.trackEvent('feature_discovery', {
      feature,
      source,
    });
  }

  static trackTutorialStep(step: number, completed: boolean): void {
    this.trackEvent('tutorial_step', {
      step,
      completed,
    });
  }

  // Settings and Preferences
  static trackSettingsChange(setting: string, oldValue: any, newValue: any): void {
    this.trackEvent('settings_change', {
      setting,
      old_value: oldValue,
      new_value: newValue,
    });
  }

  static trackLanguageChange(oldLanguage: string, newLanguage: string): void {
    this.trackEvent('language_change', {
      old_language: oldLanguage,
      new_language: newLanguage,
    });
  }

  static trackThemeChange(oldTheme: string, newTheme: string): void {
    this.trackEvent('theme_change', {
      old_theme: oldTheme,
      new_theme: newTheme,
    });
  }

  // Helper Methods
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // In a real app, you would send to services like:
      // - Firebase Analytics
      // - Mixpanel
      // - Amplitude
      // - Custom analytics endpoint

      if (__DEV__) {
        return; // Don't send in development
      }

      // Example implementation:
      // await fetch('/api/analytics/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  static getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  static clearEvents(): void {
    this.events = [];
  }

  static getUserProperties(): Partial<UserProperties> {
    return { ...this.userProperties };
  }

  static getSessionId(): string {
    return this.sessionId;
  }

  static getUserId(): string | null {
    return this.userId;
  }

  // Batch event sending for performance
  static async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Send all events in batch
      if (!__DEV__) {
        // await this.sendEventsBatch(eventsToSend);
      }
    } catch (error) {
      // If failed, add events back to queue
      this.events.unshift(...eventsToSend);
      console.error('Failed to flush analytics events:', error);
    }
  }

  // Call this when app goes to background
  static onAppBackground(): void {
    this.flushEvents();
  }

  // Call this when app comes to foreground
  static onAppForeground(): void {
    this.sessionId = this.generateSessionId();
    this.trackSessionStart();
  }
}