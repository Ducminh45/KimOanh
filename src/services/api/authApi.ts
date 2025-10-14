import { apiClient, ApiResponse } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    isEmailVerified: boolean;
    isPremium: boolean;
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    dateOfBirth?: string;
    gender?: 'male' | 'female';
    height?: number;
    weight?: number;
    activityLevel?: string;
    goal?: string;
    dietaryPreferences?: string[];
    allergies?: string[];
  };
}

export class AuthApi {
  /**
   * Login with email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store auth token
    if (response.data.tokens.accessToken) {
      await apiClient.setAuthToken(response.data.tokens.accessToken);
    }
    
    return response.data;
  }

  /**
   * Register new user account
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    // Store auth token
    if (response.data.tokens.accessToken) {
      await apiClient.setAuthToken(response.data.tokens.accessToken);
    }
    
    return response.data;
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local auth data
      await apiClient.clearAuthToken();
    }
  }

  /**
   * Send forgot password email
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }

  /**
   * Verify email address
   */
  static async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', data);
    return response.data;
  }

  /**
   * Resend email verification
   */
  static async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }> {
    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    }>('/auth/refresh-token', data);
    
    // Update stored auth token
    if (response.data.accessToken) {
      await apiClient.setAuthToken(response.data.accessToken);
    }
    
    return response.data;
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  /**
   * Update current user profile
   */
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', data);
    return response.data;
  }

  /**
   * Change password
   */
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  }

  /**
   * Delete user account
   */
  static async deleteAccount(data: { password: string }): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/auth/account', {
      data,
    });
    
    // Clear auth data after successful deletion
    await apiClient.clearAuthToken();
    
    return response.data;
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<{ avatarUrl: string }> {
    const response = await apiClient.uploadFile<{ avatarUrl: string }>(
      '/auth/avatar',
      file
    );
    return response.data;
  }

  /**
   * Social login (Google, Facebook, etc.)
   */
  static async socialLogin(provider: 'google' | 'facebook', data: {
    accessToken: string;
    idToken?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`/auth/social/${provider}`, data);
    
    // Store auth token
    if (response.data.tokens.accessToken) {
      await apiClient.setAuthToken(response.data.tokens.accessToken);
    }
    
    return response.data;
  }

  /**
   * Link social account
   */
  static async linkSocialAccount(provider: 'google' | 'facebook', data: {
    accessToken: string;
    idToken?: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/auth/link/${provider}`, data);
    return response.data;
  }

  /**
   * Unlink social account
   */
  static async unlinkSocialAccount(provider: 'google' | 'facebook'): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/auth/link/${provider}`);
    return response.data;
  }

  /**
   * Enable two-factor authentication
   */
  static async enableTwoFactor(): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    const response = await apiClient.post<{
      qrCode: string;
      secret: string;
      backupCodes: string[];
    }>('/auth/2fa/enable');
    return response.data;
  }

  /**
   * Verify two-factor authentication setup
   */
  static async verifyTwoFactor(data: { token: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/2fa/verify', data);
    return response.data;
  }

  /**
   * Disable two-factor authentication
   */
  static async disableTwoFactor(data: { token: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/2fa/disable', data);
    return response.data;
  }

  /**
   * Generate new backup codes
   */
  static async generateBackupCodes(): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post<{ backupCodes: string[] }>('/auth/2fa/backup-codes');
    return response.data;
  }

  /**
   * Check if email is available
   */
  static async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
    return response.data;
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(): Promise<Array<{
    id: string;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    location?: string;
    lastActive: string;
    isCurrent: boolean;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      deviceName: string;
      deviceType: string;
      ipAddress: string;
      location?: string;
      lastActive: string;
      isCurrent: boolean;
    }>>('/auth/sessions');
    return response.data;
  }

  /**
   * Revoke user session
   */
  static async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Revoke all sessions except current
   */
  static async revokeAllOtherSessions(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/auth/sessions/others');
    return response.data;
  }
}

export default AuthApi;