import * as ImagePicker from 'expo-image-picker';

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Media library permission error:', error);
    return false;
  }
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (
  options?: ImagePicker.ImagePickerOptions
): Promise<string | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Pick image error:', error);
    return null;
  }
};

/**
 * Take photo with camera
 */
export const takePhoto = async (
  options?: ImagePicker.ImagePickerOptions
): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Take photo error:', error);
    return null;
  }
};

/**
 * Convert image to base64
 */
export const imageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Image to base64 error:', error);
    return null;
  }
};

/**
 * Compress image
 */
export const compressImage = async (
  uri: string,
  quality: number = 0.7
): Promise<string | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Compress image error:', error);
    return null;
  }
};

/**
 * Get image dimensions
 */
export const getImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve(null)
    );
  });
};

export default {
  requestCameraPermission,
  requestMediaLibraryPermission,
  pickImageFromGallery,
  takePhoto,
  imageToBase64,
  compressImage,
  getImageDimensions,
};
