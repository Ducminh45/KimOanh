import { useEffect } from 'react';
import { useAuthStore } from '@store/authStore';

/**
 * Hook to manage authentication
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    loadAuthState,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    // Load auth state on mount
    loadAuthState();
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  };
};

export default useAuth;
