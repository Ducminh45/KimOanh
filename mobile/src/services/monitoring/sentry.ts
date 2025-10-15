/**
 * Error Tracking & Monitoring with Sentry
 * 
 * Install: npm install @sentry/react-native
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const SENTRY_DSN = process.env.SENTRY_DSN || '';

/**
 * Initialize Sentry
 */
export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    enabled: !__DEV__, // Disable in development
    
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions in production
    
    // Release tracking
    release: `nutriscanvn@1.1.0`,
    dist: Platform.OS === 'ios' ? '1' : '2',
    
    // Breadcrumbs
    maxBreadcrumbs: 50,
    
    // Integrations
    integrations: [
      new Sentry.ReactNativeTracing({
        tracingOrigins: ['localhost', 'api.nutriscanvn.com', /^\//],
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
      }),
    ],
    
    // Before send hook
    beforeSend(event, hint) {
      // Filter out some errors
      if (event.exception) {
        const error = hint.originalException;
        
        // Don't send network errors in development
        if (__DEV__ && error?.message?.includes('Network')) {
          return null;
        }
      }
      
      return event;
    },
  });
};

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
};

/**
 * Capture message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context
 */
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

/**
 * Clear user context
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Set tag
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Set context
 */
export const setContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

/**
 * Start transaction (for performance monitoring)
 */
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Wrap navigation container for route tracking
 */
export const wrapNavigationContainer = (NavigationContainer: any) => {
  return Sentry.wrap(NavigationContainer);
};

/**
 * Track API call performance
 */
export const trackAPICall = async <T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> => {
  const transaction = startTransaction(`API ${method} ${endpoint}`, 'http.client');
  
  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    captureException(error as Error, {
      endpoint,
      method,
    });
    throw error;
  } finally {
    transaction.finish();
  }
};

/**
 * Track screen view
 */
export const trackScreenView = (screenName: string) => {
  addBreadcrumb({
    type: 'navigation',
    category: 'navigation',
    message: `Navigated to ${screenName}`,
    level: 'info',
    data: {
      screen: screenName,
    },
  });
};

/**
 * Track user action
 */
export const trackUserAction = (action: string, data?: Record<string, any>) => {
  addBreadcrumb({
    type: 'user',
    category: 'user.action',
    message: action,
    level: 'info',
    data,
  });
};

/**
 * Handle async errors
 */
export const handleAsyncError = async <T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    captureException(error as Error, {
      context: errorMessage || 'Async operation failed',
    });
    return null;
  }
};

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  setTag,
  setContext,
  startTransaction,
  wrapNavigationContainer,
  trackAPICall,
  trackScreenView,
  trackUserAction,
  handleAsyncError,
};
