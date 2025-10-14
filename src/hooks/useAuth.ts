import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { NotificationService } from '@/services/notifications/notificationService';

export interface UseAuthReturn {
  // State
  user: ReturnType<typeof useAuthStore>['user'];
  token: ReturnType<typeof useAuthStore>['token'];
  isAuthenticated: ReturnType<typeof useAuthStore>['isAuthenticated'];
  isLoading: ReturnType<typeof useAuthStore>['isLoading'];
  error: ReturnType<typeof useAuthStore>['error'];
  
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
  updateProfile: (data: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  uploadAvatar: (file: { uri: string; name: string; type: string }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  clearError: () => void;
  
  // Computed values
  isEmailVerified: boolean;
  isPremium: boolean;
  fullName: string;
  initials: string;
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    updateProfile: storeUpdateProfile,
    changePassword: storeChangePassword,
    forgotPassword: storeForgotPassword,
    resetPassword: storeResetPassword,
    verifyEmail: storeVerifyEmail,
    resendVerificationEmail: storeResendVerificationEmail,
    uploadAvatar: storeUploadAvatar,
    deleteAccount: storeDeleteAccount,
    clearError: storeClearError,
    initializeAuth,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Enhanced login with additional setup
  const login = useCallback(async (email: string, password: string) => {
    await storeLogin(email, password);
    
    // Setup user-specific services after successful login
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      // Initialize analytics with user data
      AnalyticsService.setUserId(currentUser.id);
      AnalyticsService.setUserProperties({
        userId: currentUser.id,
        isPremium: currentUser.isPremium,
        isEmailVerified: currentUser.isEmailVerified,
      });

      // Setup notifications if user has enabled them
      await NotificationService.initialize();
    }
  }, [storeLogin]);

  // Enhanced register with additional setup
  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    await storeRegister(userData);
    
    // Setup user-specific services after successful registration
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      // Initialize analytics with user data
      AnalyticsService.setUserId(currentUser.id);
      AnalyticsService.setUserProperties({
        userId: currentUser.id,
        isPremium: currentUser.isPremium,
        isEmailVerified: currentUser.isEmailVerified,
      });

      // Setup notifications
      await NotificationService.initialize();
      
      // Track app install for new users
      await AnalyticsService.trackAppInstall();
    }
  }, [storeRegister]);

  // Enhanced logout with cleanup
  const logout = useCallback(async () => {
    await storeLogout();
    
    // Clear all user-specific data and services
    AnalyticsService.setUserId('');
    await NotificationService.cancelAllNotifications();
  }, [storeLogout]);

  // Enhanced profile update with analytics
  const updateProfile = useCallback(async (data: any) => {
    await storeUpdateProfile(data);
    
    // Update analytics user properties
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      AnalyticsService.setUserProperties({
        userId: currentUser.id,
        isPremium: currentUser.isPremium,
        isEmailVerified: currentUser.isEmailVerified,
      });
    }
  }, [storeUpdateProfile]);

  // Enhanced change password with analytics
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await storeChangePassword(currentPassword, newPassword);
    AnalyticsService.trackEvent('password_changed_success');
  }, [storeChangePassword]);

  // Enhanced forgot password with analytics
  const forgotPassword = useCallback(async (email: string) => {
    await storeForgotPassword(email);
    AnalyticsService.trackEvent('forgot_password_requested', { email });
  }, [storeForgotPassword]);

  // Enhanced reset password with analytics
  const resetPassword = useCallback(async (token: string, password: string, confirmPassword: string) => {
    await storeResetPassword(token, password, confirmPassword);
    AnalyticsService.trackEvent('password_reset_success');
  }, [storeResetPassword]);

  // Enhanced verify email with analytics
  const verifyEmail = useCallback(async (token: string) => {
    await storeVerifyEmail(token);
    AnalyticsService.trackEvent('email_verified_success');
  }, [storeVerifyEmail]);

  // Enhanced resend verification with analytics
  const resendVerificationEmail = useCallback(async () => {
    await storeResendVerificationEmail();
    AnalyticsService.trackEvent('verification_email_resent');
  }, [storeResendVerificationEmail]);

  // Enhanced upload avatar with analytics
  const uploadAvatar = useCallback(async (file: { uri: string; name: string; type: string }) => {
    await storeUploadAvatar(file);
    AnalyticsService.trackEvent('avatar_uploaded_success');
  }, [storeUploadAvatar]);

  // Enhanced delete account with cleanup
  const deleteAccount = useCallback(async (password: string) => {
    await storeDeleteAccount(password);
    
    // Clear all data and services
    AnalyticsService.setUserId('');
    await NotificationService.cancelAllNotifications();
    AnalyticsService.trackEvent('account_deleted_success');
  }, [storeDeleteAccount]);

  // Computed values
  const isEmailVerified = user?.isEmailVerified ?? false;
  const isPremium = user?.isPremium ?? false;
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const initials = user 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '';

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    uploadAvatar,
    deleteAccount,
    clearError: storeClearError,
    
    // Computed values
    isEmailVerified,
    isPremium,
    fullName,
    initials,
  };
};

export default useAuth;