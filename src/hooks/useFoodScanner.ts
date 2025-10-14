import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useFoodStore } from '@/store/foodStore';
import { useAuth } from './useAuth';
import { ImageUtils, ImageResult } from '@/utils/imageUtils';
import { PermissionManager } from '@/utils/permissions';
import { ErrorHandler } from '@/utils/errorHandler';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { Config } from '@/constants/config';

export interface UseFoodScannerOptions {
  maxScansPerDay?: number;
  requirePremiumForUnlimited?: boolean;
  onScanComplete?: (result: any) => void;
  onScanError?: (error: any) => void;
}

export interface UseFoodScannerReturn {
  // State
  isScanning: boolean;
  scanResult: any;
  scanHistory: any[];
  scansUsedToday: number;
  scansRemaining: number;
  canScan: boolean;
  
  // Actions
  scanFromCamera: () => Promise<void>;
  scanFromGallery: () => Promise<void>;
  scanImage: (imageUri: string) => Promise<any>;
  clearScanResult: () => void;
  
  // Permissions
  requestCameraPermission: () => Promise<boolean>;
  requestGalleryPermission: () => Promise<boolean>;
  
  // Utilities
  validateScanLimits: () => boolean;
  getScanLimitMessage: () => string;
}

export const useFoodScanner = (options: UseFoodScannerOptions = {}): UseFoodScannerReturn => {
  const {
    maxScansPerDay = Config.FREE_SCANS_PER_DAY,
    requirePremiumForUnlimited = true,
    onScanComplete,
    onScanError,
  } = options;

  const { isPremium } = useAuth();
  const {
    isScanning,
    scanResult,
    scanHistory,
    scanFoodImage,
    clearScanResult: storeClearScanResult,
  } = useFoodStore();

  const [scansUsedToday, setScansUsedToday] = useState(0);
  const scanTimerRef = useRef<NodeJS.Timeout>();

  // Calculate scans remaining
  const scansRemaining = isPremium && requirePremiumForUnlimited 
    ? Infinity 
    : Math.max(0, maxScansPerDay - scansUsedToday);

  const canScan = scansRemaining > 0;

  // Validate scan limits
  const validateScanLimits = useCallback((): boolean => {
    if (isPremium && requirePremiumForUnlimited) {
      return true;
    }

    if (scansUsedToday >= maxScansPerDay) {
      const message = getScanLimitMessage();
      Alert.alert('Đã hết lượt quét', message);
      
      // Track analytics
      AnalyticsService.trackEvent('scan_limit_reached', {
        scans_used: scansUsedToday,
        max_scans: maxScansPerDay,
        is_premium: isPremium,
      });
      
      return false;
    }

    return true;
  }, [isPremium, scansUsedToday, maxScansPerDay, requirePremiumForUnlimited]);

  // Get scan limit message
  const getScanLimitMessage = useCallback((): string => {
    if (isPremium && requirePremiumForUnlimited) {
      return 'Bạn có thể quét không giới hạn với tài khoản Premium!';
    }

    if (scansUsedToday >= maxScansPerDay) {
      return `Bạn đã sử dụng hết ${maxScansPerDay} lượt quét miễn phí hôm nay. Nâng cấp Premium để quét không giới hạn!`;
    }

    return `Còn lại ${scansRemaining} lượt quét miễn phí hôm nay.`;
  }, [isPremium, scansUsedToday, maxScansPerDay, scansRemaining, requirePremiumForUnlimited]);

  // Request camera permission
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const hasPermission = await PermissionManager.ensurePermission('camera');
      
      if (!hasPermission) {
        AnalyticsService.trackEvent('camera_permission_denied');
      }
      
      return hasPermission;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  }, []);

  // Request gallery permission
  const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
    try {
      const hasPermission = await PermissionManager.ensurePermission('mediaLibrary');
      
      if (!hasPermission) {
        AnalyticsService.trackEvent('gallery_permission_denied');
      }
      
      return hasPermission;
    } catch (error) {
      console.error('Failed to request gallery permission:', error);
      return false;
    }
  }, []);

  // Scan from camera
  const scanFromCamera = useCallback(async (): Promise<void> => {
    try {
      // Validate scan limits
      if (!validateScanLimits()) {
        return;
      }

      // Request camera permission
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        throw ErrorHandler.createError(
          'CAMERA_PERMISSION_DENIED',
          'Cần quyền truy cập camera để quét thực phẩm'
        );
      }

      // Take photo
      const image = await ImageUtils.pickImageFromCamera({
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (!image) {
        return; // User cancelled
      }

      // Scan the image
      await scanImage(image.uri);

    } catch (error) {
      console.error('Failed to scan from camera:', error);
      
      if (onScanError) {
        onScanError(error);
      } else {
        const appError = ErrorHandler.handleCameraError(error);
        Alert.alert('Lỗi camera', appError.message);
      }
      
      AnalyticsService.trackError('camera_scan_failed', ErrorHandler.getErrorMessage(error));
    }
  }, [validateScanLimits, requestCameraPermission, scanImage, onScanError]);

  // Scan from gallery
  const scanFromGallery = useCallback(async (): Promise<void> => {
    try {
      // Validate scan limits
      if (!validateScanLimits()) {
        return;
      }

      // Request gallery permission
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        throw ErrorHandler.createError(
          'GALLERY_PERMISSION_DENIED',
          'Cần quyền truy cập thư viện ảnh để chọn hình ảnh'
        );
      }

      // Pick image from gallery
      const image = await ImageUtils.pickImageFromGallery({
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (!image) {
        return; // User cancelled
      }

      // Scan the image
      await scanImage(image.uri);

    } catch (error) {
      console.error('Failed to scan from gallery:', error);
      
      if (onScanError) {
        onScanError(error);
      } else {
        const appError = ErrorHandler.handleImageError(error);
        Alert.alert('Lỗi chọn ảnh', appError.message);
      }
      
      AnalyticsService.trackError('gallery_scan_failed', ErrorHandler.getErrorMessage(error));
    }
  }, [validateScanLimits, requestGalleryPermission, scanImage, onScanError]);

  // Scan image
  const scanImage = useCallback(async (imageUri: string): Promise<any> => {
    try {
      // Validate scan limits one more time
      if (!validateScanLimits()) {
        return null;
      }

      // Start scan timer for analytics
      const scanStartTime = Date.now();

      // Perform the scan
      const result = await scanFoodImage(imageUri);

      // Calculate scan duration
      const scanDuration = Date.now() - scanStartTime;

      // Update scans used count
      setScansUsedToday(prev => prev + 1);

      // Track analytics
      AnalyticsService.trackFoodScanResult(
        result.foods[0]?.name || 'Unknown',
        result.confidence,
        result.foods[0]?.nutrition?.calories || 0,
        scanDuration
      );

      // Call completion callback
      if (onScanComplete) {
        onScanComplete(result);
      }

      return result;

    } catch (error) {
      console.error('Failed to scan image:', error);
      
      if (onScanError) {
        onScanError(error);
      } else {
        const appError = ErrorHandler.handleGeminiError(error);
        Alert.alert('Lỗi quét thực phẩm', appError.message);
      }
      
      AnalyticsService.trackError('food_scan_failed', ErrorHandler.getErrorMessage(error));
      throw error;
    }
  }, [validateScanLimits, scanFoodImage, onScanComplete, onScanError]);

  // Clear scan result
  const clearScanResult = useCallback(() => {
    storeClearScanResult();
  }, [storeClearScanResult]);

  // Reset daily scan count at midnight
  const resetDailyScanCount = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }
    
    scanTimerRef.current = setTimeout(() => {
      setScansUsedToday(0);
      resetDailyScanCount(); // Set up next reset
    }, timeUntilMidnight);
  }, []);

  // Initialize daily scan count reset
  useState(() => {
    resetDailyScanCount();
    return null;
  });

  // Cleanup timer on unmount
  useState(() => {
    return () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
    };
  });

  return {
    // State
    isScanning,
    scanResult,
    scanHistory,
    scansUsedToday,
    scansRemaining,
    canScan,
    
    // Actions
    scanFromCamera,
    scanFromGallery,
    scanImage,
    clearScanResult,
    
    // Permissions
    requestCameraPermission,
    requestGalleryPermission,
    
    // Utilities
    validateScanLimits,
    getScanLimitMessage,
  };
};

export default useFoodScanner;