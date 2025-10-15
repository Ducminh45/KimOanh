/**
 * Analytics service for tracking user events
 * Can be integrated with Firebase Analytics, Mixpanel, etc.
 */

interface AnalyticsEvent {
  name: string;
  properties?: { [key: string]: any };
  timestamp: Date;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userId: string | null = null;

  /**
   * Initialize analytics with user ID
   */
  setUserId(userId: string) {
    this.userId = userId;
    console.log('Analytics: User ID set', userId);
  }

  /**
   * Clear user ID on logout
   */
  clearUserId() {
    this.userId = null;
    console.log('Analytics: User ID cleared');
  }

  /**
   * Track event
   */
  trackEvent(eventName: string, properties?: { [key: string]: any }) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        platform: 'mobile',
      },
      timestamp: new Date(),
    };

    this.events.push(event);
    console.log('Analytics Event:', eventName, properties);

    // Here you would send to your analytics service
    // Example: Firebase, Mixpanel, Amplitude, etc.
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties?: { [key: string]: any }) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track food scan
   */
  trackFoodScan(success: boolean, foodsDetected: number) {
    this.trackEvent('food_scan', {
      success,
      foods_detected: foodsDetected,
    });
  }

  /**
   * Track food log
   */
  trackFoodLog(mealType: string, calories: number) {
    this.trackEvent('food_log', {
      meal_type: mealType,
      calories,
    });
  }

  /**
   * Track exercise log
   */
  trackExerciseLog(exerciseType: string, duration: number, caloriesBurned: number) {
    this.trackEvent('exercise_log', {
      exercise_type: exerciseType,
      duration_minutes: duration,
      calories_burned: caloriesBurned,
    });
  }

  /**
   * Track water log
   */
  trackWaterLog(amountMl: number) {
    this.trackEvent('water_log', {
      amount_ml: amountMl,
    });
  }

  /**
   * Track goal achievement
   */
  trackGoalAchievement(goalType: string) {
    this.trackEvent('goal_achievement', {
      goal_type: goalType,
    });
  }

  /**
   * Track subscription
   */
  trackSubscription(plan: string, price: number) {
    this.trackEvent('subscription_started', {
      plan,
      price,
    });
  }

  /**
   * Track social interaction
   */
  trackSocialInteraction(type: 'like' | 'comment' | 'post' | 'follow') {
    this.trackEvent('social_interaction', {
      interaction_type: type,
    });
  }

  /**
   * Track AI chat
   */
  trackAIChat(messageLength: number) {
    this.trackEvent('ai_chat', {
      message_length: messageLength,
    });
  }

  /**
   * Track onboarding completion
   */
  trackOnboardingComplete(step: number) {
    this.trackEvent('onboarding_complete', {
      final_step: step,
    });
  }

  /**
   * Track error
   */
  trackError(errorType: string, errorMessage: string) {
    this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
    });
  }

  /**
   * Get all events (for debugging)
   */
  getAllEvents(): AnalyticsEvent[] {
    return this.events;
  }

  /**
   * Clear events history
   */
  clearEvents() {
    this.events = [];
  }
}

export default new AnalyticsService();
