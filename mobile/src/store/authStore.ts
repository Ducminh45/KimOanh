import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@types';
import apiClient from '@services/api/apiClient';
import authApi from '@services/api/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  loadAuthState: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: async (token, refreshToken) => {
    set({ token, refreshToken });
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    await apiClient.setAuthToken(token);
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        
        await get().setTokens(token, refreshToken);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      } else {
        set({
          error: response.message || 'Login failed',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register({ email, password, fullName });
      
      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        
        await get().setTokens(token, refreshToken);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      } else {
        set({
          error: response.message || 'Registration failed',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    await apiClient.clearAuth();
    await AsyncStorage.clear();
    
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  refreshAuth: async () => {
    const { refreshToken } = get();
    
    if (!refreshToken) return;
    
    try {
      const response = await authApi.refreshToken(refreshToken);
      
      if (response.success && response.data) {
        const { token } = response.data;
        await apiClient.setAuthToken(token);
        set({ token });
        await AsyncStorage.setItem('auth_token', token);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await get().logout();
    }
  },

  loadAuthState: async () => {
    set({ isLoading: true });
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (token && refreshToken) {
        await apiClient.setAuthToken(token);
        
        // Get user profile
        const response = await authApi.getProfile();
        
        if (response.success && response.data) {
          set({
            user: response.data.user,
            token,
            refreshToken,
            isAuthenticated: true,
          });
        } else {
          // Token invalid, clear auth
          await get().logout();
        }
      }
    } catch (error) {
      console.error('Load auth state error:', error);
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },
}));

export default useAuthStore;
