import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  height?: number; // cm
  weight?: number; // kg
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  goal?: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_WEIGHT';
  targetWeight?: number;
  weeklyGoal?: number; // kg per week
  dietaryPreferences?: string[];
  allergies?: string[];
  medicalConditions?: string[];
  isEmailVerified: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string;
  timezone: string;
  language: string;
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
    distance: 'km' | 'miles';
    temperature: 'celsius' | 'fahrenheit';
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showProgress: boolean;
    showStats: boolean;
  };
  notifications: {
    mealReminders: boolean;
    waterReminders: boolean;
    exerciseReminders: boolean;
    socialUpdates: boolean;
    weeklyReports: boolean;
    achievements: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalScans: number;
  totalCaloriesLogged: number;
  totalExerciseMinutes: number;
  totalWaterConsumed: number;
  streakDays: number;
  longestStreak: number;
  daysActive: number;
  averageCaloriesPerDay: number;
  averageExercisePerWeek: number;
  weightLossProgress: number;
  achievementsUnlocked: number;
  totalPoints: number;
  rank: number;
  joinDate: string;
  lastActiveDate: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  bmi: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  amount: number; // ml
  loggedAt: string;
  createdAt: string;
}

export interface ExerciseLog {
  id: string;
  userId: string;
  type: string;
  name: string;
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'weight' | 'calories' | 'exercise' | 'water' | 'custom';
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: string;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface DailyProgress {
  date: string;
  calories: {
    consumed: number;
    goal: number;
    remaining: number;
  };
  water: {
    consumed: number;
    goal: number;
    remaining: number;
  };
  exercise: {
    minutes: number;
    goal: number;
    caloriesBurned: number;
  };
  steps?: {
    count: number;
    goal: number;
  };
  weight?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  goalsCompleted: number;
  totalGoals: number;
  streakDays: number;
}

export class UserApi {
  /**
   * Get user profile
   */
  static async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/user/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/user/profile', data);
    return response.data;
  }

  /**
   * Upload profile avatar
   */
  static async uploadAvatar(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<{ avatarUrl: string }> {
    const response = await apiClient.uploadFile<{ avatarUrl: string }>('/user/avatar', file);
    return response.data;
  }

  /**
   * Get user statistics
   */
  static async getStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/user/stats');
    return response.data;
  }

  /**
   * Get user achievements
   */
  static async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/user/achievements');
    return response.data;
  }

  /**
   * Get user goals
   */
  static async getGoals(): Promise<Goal[]> {
    const response = await apiClient.get<Goal[]>('/user/goals');
    return response.data;
  }

  /**
   * Create new goal
   */
  static async createGoal(data: Omit<Goal, 'id' | 'userId' | 'currentValue' | 'isCompleted' | 'completedAt' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const response = await apiClient.post<Goal>('/user/goals', data);
    return response.data;
  }

  /**
   * Update goal
   */
  static async updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
    const response = await apiClient.put<Goal>(`/user/goals/${id}`, data);
    return response.data;
  }

  /**
   * Delete goal
   */
  static async deleteGoal(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/user/goals/${id}`);
    return response.data;
  }

  /**
   * Log weight
   */
  static async logWeight(data: {
    weight: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    notes?: string;
    loggedAt?: string;
  }): Promise<WeightLog> {
    const response = await apiClient.post<WeightLog>('/user/weight', data);
    return response.data;
  }

  /**
   * Get weight logs
   */
  static async getWeightLogs(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<WeightLog[]> {
    const response = await apiClient.get<WeightLog[]>('/user/weight', { params });
    return response.data;
  }

  /**
   * Update weight log
   */
  static async updateWeightLog(id: string, data: Partial<WeightLog>): Promise<WeightLog> {
    const response = await apiClient.put<WeightLog>(`/user/weight/${id}`, data);
    return response.data;
  }

  /**
   * Delete weight log
   */
  static async deleteWeightLog(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/user/weight/${id}`);
    return response.data;
  }

  /**
   * Log water intake
   */
  static async logWater(data: {
    amount: number;
    loggedAt?: string;
  }): Promise<WaterLog> {
    const response = await apiClient.post<WaterLog>('/user/water', data);
    return response.data;
  }

  /**
   * Get water logs for date
   */
  static async getWaterLogs(date: string): Promise<WaterLog[]> {
    const response = await apiClient.get<WaterLog[]>(`/user/water?date=${date}`);
    return response.data;
  }

  /**
   * Update water log
   */
  static async updateWaterLog(id: string, data: Partial<WaterLog>): Promise<WaterLog> {
    const response = await apiClient.put<WaterLog>(`/user/water/${id}`, data);
    return response.data;
  }

  /**
   * Delete water log
   */
  static async deleteWaterLog(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/user/water/${id}`);
    return response.data;
  }

  /**
   * Log exercise
   */
  static async logExercise(data: {
    type: string;
    name: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    caloriesBurned?: number;
    notes?: string;
    loggedAt?: string;
  }): Promise<ExerciseLog> {
    const response = await apiClient.post<ExerciseLog>('/user/exercise', data);
    return response.data;
  }

  /**
   * Get exercise logs
   */
  static async getExerciseLogs(params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<ExerciseLog[]> {
    const response = await apiClient.get<ExerciseLog[]>('/user/exercise', { params });
    return response.data;
  }

  /**
   * Update exercise log
   */
  static async updateExerciseLog(id: string, data: Partial<ExerciseLog>): Promise<ExerciseLog> {
    const response = await apiClient.put<ExerciseLog>(`/user/exercise/${id}`, data);
    return response.data;
  }

  /**
   * Delete exercise log
   */
  static async deleteExerciseLog(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/user/exercise/${id}`);
    return response.data;
  }

  /**
   * Get daily progress
   */
  static async getDailyProgress(date: string): Promise<DailyProgress> {
    const response = await apiClient.get<DailyProgress>(`/user/progress/daily?date=${date}`);
    return response.data;
  }

  /**
   * Get progress trends
   */
  static async getProgressTrends(period: 'week' | 'month' | '3months'): Promise<{
    dates: string[];
    weight: number[];
    calories: number[];
    water: number[];
    exercise: number[];
    streakDays: number[];
  }> {
    const response = await apiClient.get<{
      dates: string[];
      weight: number[];
      calories: number[];
      water: number[];
      exercise: number[];
      streakDays: number[];
    }>(`/user/progress/trends?period=${period}`);
    return response.data;
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(settings: UserProfile['notifications']): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/user/notifications', settings);
    return response.data;
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(settings: UserProfile['privacy']): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/user/privacy', settings);
    return response.data;
  }

  /**
   * Update unit preferences
   */
  static async updateUnits(units: UserProfile['units']): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/user/units', units);
    return response.data;
  }

  /**
   * Get user's friends
   */
  static async getFriends(): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isOnline: boolean;
    lastActive: string;
    mutualFriends: number;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      isOnline: boolean;
      lastActive: string;
      mutualFriends: number;
    }>>('/user/friends');
    return response.data;
  }

  /**
   * Search users
   */
  static async searchUsers(query: string): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isFriend: boolean;
    mutualFriends: number;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      isFriend: boolean;
      mutualFriends: number;
    }>>(`/user/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  /**
   * Send friend request
   */
  static async sendFriendRequest(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/user/friends/request/${userId}`);
    return response.data;
  }

  /**
   * Accept friend request
   */
  static async acceptFriendRequest(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/user/friends/accept/${userId}`);
    return response.data;
  }

  /**
   * Decline friend request
   */
  static async declineFriendRequest(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/user/friends/request/${userId}`);
    return response.data;
  }

  /**
   * Remove friend
   */
  static async removeFriend(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/user/friends/${userId}`);
    return response.data;
  }

  /**
   * Get friend requests
   */
  static async getFriendRequests(): Promise<{
    sent: Array<{
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      sentAt: string;
    }>;
    received: Array<{
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      sentAt: string;
    }>;
  }> {
    const response = await apiClient.get<{
      sent: Array<{
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        sentAt: string;
      }>;
      received: Array<{
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        sentAt: string;
      }>;
    }>('/user/friends/requests');
    return response.data;
  }

  /**
   * Export user data
   */
  static async exportData(): Promise<{ downloadUrl: string }> {
    const response = await apiClient.post<{ downloadUrl: string }>('/user/export');
    return response.data;
  }

  /**
   * Delete user account
   */
  static async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/user/account', {
      data: { password },
    });
    return response.data;
  }

  /**
   * Get user subscription status
   */
  static async getSubscriptionStatus(): Promise<{
    isPremium: boolean;
    plan?: string;
    expiresAt?: string;
    autoRenew: boolean;
    features: string[];
  }> {
    const response = await apiClient.get<{
      isPremium: boolean;
      plan?: string;
      expiresAt?: string;
      autoRenew: boolean;
      features: string[];
    }>('/user/subscription');
    return response.data;
  }

  /**
   * Update subscription
   */
  static async updateSubscription(plan: 'monthly' | 'yearly'): Promise<{
    paymentUrl: string;
    subscriptionId: string;
  }> {
    const response = await apiClient.post<{
      paymentUrl: string;
      subscriptionId: string;
    }>('/user/subscription', { plan });
    return response.data;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/user/subscription');
    return response.data;
  }
}

export default UserApi;