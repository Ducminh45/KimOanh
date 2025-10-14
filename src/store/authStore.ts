import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthApi, User, AuthResponse } from '@/services/api/authApi';
import { StorageService } from '@/services/storage/storageService';
import { ErrorHandler, AppError } from '@/utils/errorHandler';
import { AnalyticsService } from '@/services/analytics/analyticsService';

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AppError | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  uploadAvatar: (file: { uri: string; name: string; type: string }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response: AuthResponse = await AuthApi.login({ email, password });
          
          // Update state
          set({
            user: response.user,
            token: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store tokens securely
          await StorageService.setUserToken(response.tokens.accessToken);
          await StorageService.setItem('refresh_token', response.tokens.refreshToken, { secure: true });
          await StorageService.setUserProfile(response.user);

          // Track analytics
          AnalyticsService.trackLogin('email');
          AnalyticsService.setUserId(response.user.id);
          AnalyticsService.setUserProperties({
            userId: response.user.id,
            isPremium: response.user.isPremium,
            isEmailVerified: response.user.isEmailVerified,
          });

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleAuthError(error)
            : ErrorHandler.createError('LOGIN_ERROR', 'Login failed');
          
          set({
            isLoading: false,
            error: appError,
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
          
          throw appError;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          const response: AuthResponse = await AuthApi.register(userData);
          
          // Update state
          set({
            user: response.user,
            token: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store tokens securely
          await StorageService.setUserToken(response.tokens.accessToken);
          await StorageService.setItem('refresh_token', response.tokens.refreshToken, { secure: true });
          await StorageService.setUserProfile(response.user);

          // Track analytics
          AnalyticsService.trackSignUp('email');
          AnalyticsService.setUserId(response.user.id);
          AnalyticsService.setUserProperties({
            userId: response.user.id,
            isPremium: response.user.isPremium,
            isEmailVerified: response.user.isEmailVerified,
          });

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleAuthError(error)
            : ErrorHandler.createError('REGISTER_ERROR', 'Registration failed');
          
          set({
            isLoading: false,
            error: appError,
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
          
          throw appError;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Call logout API
          await AuthApi.logout();

          // Clear state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Clear stored data
          await StorageService.removeUserToken();
          await StorageService.removeItem('refresh_token', { secure: true });
          await StorageService.removeUserProfile();

          // Track analytics
          AnalyticsService.trackLogout();

        } catch (error) {
          // Even if logout API fails, clear local state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          await StorageService.removeUserToken();
          await StorageService.removeItem('refresh_token', { secure: true });
          await StorageService.removeUserProfile();

          console.warn('Logout API failed, but local state cleared:', error);
        }
      },

      refreshAuth: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await AuthApi.refreshToken({ refreshToken });
          
          // Update tokens
          set({
            token: response.accessToken,
            refreshToken: response.refreshToken,
          });

          // Store new tokens
          await StorageService.setUserToken(response.accessToken);
          await StorageService.setItem('refresh_token', response.refreshToken, { secure: true });

        } catch (error) {
          // If refresh fails, logout user
          await get().logout();
          throw error;
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });

          const updatedUser = await AuthApi.updateProfile(data);
          
          set({
            user: updatedUser,
            isLoading: false,
          });

          // Update stored profile
          await StorageService.setUserProfile(updatedUser);

          // Track analytics
          AnalyticsService.trackEvent('profile_updated', {
            fields_updated: Object.keys(data),
          });

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleApiError(error)
            : ErrorHandler.createError('UPDATE_PROFILE_ERROR', 'Failed to update profile');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          set({ isLoading: true, error: null });

          await AuthApi.changePassword({
            currentPassword,
            newPassword,
            confirmPassword: newPassword,
          });

          set({ isLoading: false });

          // Track analytics
          AnalyticsService.trackEvent('password_changed');

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleAuthError(error)
            : ErrorHandler.createError('CHANGE_PASSWORD_ERROR', 'Failed to change password');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      forgotPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });

          await AuthApi.forgotPassword({ email });

          set({ isLoading: false });

          // Track analytics
          AnalyticsService.trackEvent('forgot_password_requested', { email });

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleApiError(error)
            : ErrorHandler.createError('FORGOT_PASSWORD_ERROR', 'Failed to send reset email');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      resetPassword: async (token, password, confirmPassword) => {
        try {
          set({ isLoading: true, error: null });

          await AuthApi.resetPassword({ token, password, confirmPassword });

          set({ isLoading: false });

          // Track analytics
          AnalyticsService.trackEvent('password_reset_completed');

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleAuthError(error)
            : ErrorHandler.createError('RESET_PASSWORD_ERROR', 'Failed to reset password');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      verifyEmail: async (token) => {
        try {
          set({ isLoading: true, error: null });

          await AuthApi.verifyEmail({ token });

          // Update user's email verification status
          const { user } = get();
          if (user) {
            const updatedUser = { ...user, isEmailVerified: true };
            set({ user: updatedUser });
            await StorageService.setUserProfile(updatedUser);
          }

          set({ isLoading: false });

          // Track analytics
          AnalyticsService.trackEvent('email_verified');

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleApiError(error)
            : ErrorHandler.createError('VERIFY_EMAIL_ERROR', 'Failed to verify email');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      resendVerificationEmail: async () => {
        try {
          set({ isLoading: true, error: null });

          await AuthApi.resendVerificationEmail();

          set({ isLoading: false });

          // Track analytics
          AnalyticsService.trackEvent('verification_email_resent');

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleApiError(error)
            : ErrorHandler.createError('RESEND_EMAIL_ERROR', 'Failed to resend verification email');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      uploadAvatar: async (file) => {
        try {
          set({ isLoading: true, error: null });

          const response = await AuthApi.uploadAvatar(file);
          
          // Update user avatar
          const { user } = get();
          if (user) {
            const updatedUser = { ...user, avatar: response.avatarUrl };
            set({ user: updatedUser });
            await StorageService.setUserProfile(updatedUser);
          }

          set({ isLoading: false });

          // Track analytics
          AnalyticsService.trackEvent('avatar_uploaded');

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleImageError(error)
            : ErrorHandler.createError('UPLOAD_AVATAR_ERROR', 'Failed to upload avatar');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      deleteAccount: async (password) => {
        try {
          set({ isLoading: true, error: null });

          await AuthApi.deleteAccount({ password });

          // Clear all data after successful deletion
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Clear stored data
          await StorageService.clear();

          // Track analytics
          AnalyticsService.trackEvent('account_deleted');

        } catch (error) {
          const appError = error instanceof Error 
            ? ErrorHandler.handleAuthError(error)
            : ErrorHandler.createError('DELETE_ACCOUNT_ERROR', 'Failed to delete account');
          
          set({
            isLoading: false,
            error: appError,
          });
          
          throw appError;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          // Try to get stored token and user data
          const [token, refreshToken, userData] = await Promise.all([
            StorageService.getUserToken(),
            StorageService.getItem<string>('refresh_token', { secure: true }),
            StorageService.getUserProfile<User>(),
          ]);

          if (token && userData) {
            // Verify token is still valid by fetching current user
            try {
              const currentUser = await AuthApi.getCurrentUser();
              
              set({
                user: currentUser,
                token,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
              });

              // Set analytics user
              AnalyticsService.setUserId(currentUser.id);
              AnalyticsService.setUserProperties({
                userId: currentUser.id,
                isPremium: currentUser.isPremium,
                isEmailVerified: currentUser.isEmailVerified,
              });

            } catch (error) {
              // Token is invalid, try to refresh
              if (refreshToken) {
                try {
                  await get().refreshAuth();
                } catch (refreshError) {
                  // Refresh failed, clear auth state
                  await get().logout();
                }
              } else {
                // No refresh token, clear auth state
                await get().logout();
              }
            }
          } else {
            // No stored auth data
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;