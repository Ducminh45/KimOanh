import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Config } from '@/constants/config';
import { ErrorHandler } from '@/utils/errorHandler';
import { NetworkUtils } from '@/utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadStoredToken();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() };

        // Log request in development
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
          if (config.data) {
            console.log('Request Data:', config.data);
          }
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const duration = Date.now() - response.config.metadata?.startTime;

        // Log response in development
        if (__DEV__) {
          console.log(
            `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`
          );
          console.log('Response Data:', response.data);
        }

        // Track API performance
        if (duration > 3000) {
          console.warn(`Slow API call: ${response.config.url} took ${duration}ms`);
        }

        return response;
      },
      async (error) => {
        const duration = error.config?.metadata?.startTime 
          ? Date.now() - error.config.metadata.startTime 
          : 0;

        // Log error in development
        if (__DEV__) {
          console.error(
            `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`
          );
          console.error('Error Details:', error.response?.data || error.message);
        }

        // Handle token expiration
        if (error.response?.status === 401) {
          await this.handleTokenExpiration();
        }

        // Handle network errors
        if (!error.response) {
          const isConnected = await NetworkUtils.isConnected();
          if (!isConnected) {
            throw ErrorHandler.createError(
              'NETWORK_ERROR',
              'Không có kết nối internet. Vui lòng kiểm tra kết nối và thử lại.'
            );
          }
        }

        // Convert to app error
        const appError = ErrorHandler.handleApiError(error);
        throw appError;
      }
    );
  }

  private async loadStoredToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.USER_TOKEN);
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('Failed to load stored token:', error);
    }
  }

  private async handleTokenExpiration(): Promise<void> {
    try {
      // Clear stored token
      await AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_DATA);
      
      this.authToken = null;

      // Emit event for auth state change
      // In a real app, you might use an event emitter or state management
      console.log('Token expired, user logged out');
    } catch (error) {
      console.error('Failed to handle token expiration:', error);
    }
  }

  async setAuthToken(token: string): Promise<void> {
    this.authToken = token;
    try {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  async clearAuthToken(): Promise<void> {
    this.authToken = null;
    try {
      await AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // HTTP Methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Paginated requests
  async getPaginated<T = any>(
    url: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sort?: string;
      filter?: Record<string, any>;
    },
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get(url, {
      ...config,
      params: {
        ...params,
        ...config?.params,
      },
    });
    return response.data;
  }

  // File upload
  async uploadFile<T = any>(
    url: string,
    file: {
      uri: string;
      name: string;
      type: string;
    },
    additionalData?: Record<string, any>,
    onUploadProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    // Add file
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    // Add additional data
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Batch requests
  async batch<T = any>(
    requests: Array<{
      method: 'get' | 'post' | 'put' | 'patch' | 'delete';
      url: string;
      data?: any;
      config?: AxiosRequestConfig;
    }>
  ): Promise<Array<ApiResponse<T>>> {
    const promises = requests.map(request => {
      switch (request.method) {
        case 'get':
          return this.get(request.url, request.config);
        case 'post':
          return this.post(request.url, request.data, request.config);
        case 'put':
          return this.put(request.url, request.data, request.config);
        case 'patch':
          return this.patch(request.url, request.data, request.config);
        case 'delete':
          return this.delete(request.url, request.config);
        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }
    });

    return Promise.all(promises);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    // Create new axios instance to cancel all pending requests
    this.client = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  // Get base URL
  getBaseURL(): string {
    return Config.API_BASE_URL;
  }

  // Update base URL
  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  // Update timeout
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type { AxiosRequestConfig, AxiosResponse };

export default apiClient;