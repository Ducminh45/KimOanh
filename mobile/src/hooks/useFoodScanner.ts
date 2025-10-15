import { useState, useCallback } from 'react';
import { useFoodStore } from '@store/foodStore';
import { useAuthStore } from '@store/authStore';
import { imageToBase64 } from '@utils/imageUtils';
import { ScannedFood } from '@types';

/**
 * Hook for food scanning functionality
 */
export const useFoodScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const { scanFood } = useFoodStore();
  const { user } = useAuthStore();

  const scan = useCallback(
    async (
      imageUri: string
    ): Promise<{ isFood: boolean; foods: ScannedFood[] } | null> => {
      setIsScanning(true);
      setScanError(null);

      try {
        // Check scan limit
        if (!user?.isPremium && user && user.scanCountToday >= user.scanLimit) {
          setScanError('Bạn đã hết lượt quét hôm nay. Nâng cấp Premium để quét không giới hạn.');
          setIsScanning(false);
          return null;
        }

        // Convert image to base64
        const base64 = await imageToBase64(imageUri);
        
        if (!base64) {
          setScanError('Không thể xử lý hình ảnh');
          setIsScanning(false);
          return null;
        }

        // Scan food
        const result = await scanFood(base64);
        
        if (!result) {
          setScanError('Không thể quét thực phẩm. Vui lòng thử lại.');
          setIsScanning(false);
          return null;
        }

        setIsScanning(false);
        return result;
      } catch (error: any) {
        setScanError(error.message || 'Lỗi khi quét thực phẩm');
        setIsScanning(false);
        return null;
      }
    },
    [scanFood, user]
  );

  const clearError = useCallback(() => {
    setScanError(null);
  }, []);

  return {
    scan,
    isScanning,
    scanError,
    clearError,
    scansRemaining: user?.isPremium
      ? -1
      : user
      ? user.scanLimit - user.scanCountToday
      : 0,
    isPremium: user?.isPremium || false,
  };
};

export default useFoodScanner;
