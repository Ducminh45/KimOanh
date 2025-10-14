import apiClient from './apiClient';
import { User, ApiResponse } from '@types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> => {
    return await apiClient.post('/auth/register', data);
  },

  /**
   * Login user
   */
  login: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> => {
    return await apiClient.post('/auth/login', data);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
    return await apiClient.post('/auth/refresh', { refreshToken });
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<ApiResponse> => {
    return await apiClient.post('/auth/logout', { refreshToken });
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return await apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    return await apiClient.post('/auth/reset-password', data);
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return await apiClient.get('/auth/profile');
  },
};

export default authApi;
