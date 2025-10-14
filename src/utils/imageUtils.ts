import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Config } from '@/constants/config';

export interface ImageOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  compress?: boolean;
}

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  size?: number;
  base64?: string;
}

export class ImageUtils {
  static async requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  static async requestMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  static async pickImageFromCamera(options: ImageOptions = {}): Promise<ImageResult | null> {
    const hasPermission = await this.requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission is required');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: options.quality || 0.8,
      base64: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return this.processImage(asset, options);
  }

  static async pickImageFromGallery(options: ImageOptions = {}): Promise<ImageResult | null> {
    const hasPermission = await this.requestMediaLibraryPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission is required');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: options.quality || 0.8,
      base64: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return this.processImage(asset, options);
  }

  static async processImage(
    asset: ImagePicker.ImagePickerAsset,
    options: ImageOptions = {}
  ): Promise<ImageResult> {
    let processedImage = asset;

    // Resize if needed
    if (options.maxWidth || options.maxHeight || options.compress) {
      const manipulatorOptions: ImageManipulator.ImageManipulatorOptions = {
        compress: options.quality || 0.8,
      };

      if (options.maxWidth || options.maxHeight) {
        manipulatorOptions.resize = {
          width: options.maxWidth,
          height: options.maxHeight,
        };
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [],
        manipulatorOptions
      );

      processedImage = {
        ...asset,
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
      };
    }

    return {
      uri: processedImage.uri,
      width: processedImage.width,
      height: processedImage.height,
      size: processedImage.fileSize,
      base64: processedImage.base64,
    };
  }

  static async compressImage(
    uri: string,
    quality: number = 0.7,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<ImageResult> {
    const actions: ImageManipulator.Action[] = [];

    if (maxWidth || maxHeight) {
      actions.push({
        resize: {
          width: maxWidth,
          height: maxHeight,
        },
      });
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
    };
  }

  static async resizeImage(
    uri: string,
    width: number,
    height: number
  ): Promise<ImageResult> {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  }

  static async cropImage(
    uri: string,
    cropArea: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    }
  ): Promise<ImageResult> {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: cropArea }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  }

  static getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({
          width: image.width,
          height: image.height,
        });
      };
      image.onerror = reject;
      image.src = uri;
    });
  }

  static validateImageSize(size: number): boolean {
    return size <= Config.MAX_IMAGE_SIZE;
  }

  static validateImageType(type: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(type.toLowerCase());
  }

  static getImageSizeInMB(size: number): number {
    return size / (1024 * 1024);
  }

  static formatImageSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  static generateThumbnail(
    uri: string,
    size: number = 150
  ): Promise<ImageResult> {
    return this.resizeImage(uri, size, size);
  }

  static async convertToBase64(uri: string): Promise<string> {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        base64: true,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.base64 || '';
  }

  static base64ToUri(base64: string, mimeType: string = 'image/jpeg'): string {
    return `data:${mimeType};base64,${base64}`;
  }

  static getImageAspectRatio(width: number, height: number): number {
    return width / height;
  }

  static calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  static async optimizeForUpload(uri: string): Promise<ImageResult> {
    const maxDimension = 1024;
    const quality = 0.8;

    return this.compressImage(uri, quality, maxDimension, maxDimension);
  }

  static async createImagePreview(uri: string): Promise<ImageResult> {
    const previewSize = 300;
    const quality = 0.6;

    return this.compressImage(uri, quality, previewSize, previewSize);
  }

  static isImageUri(uri: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const lowerUri = uri.toLowerCase();
    return imageExtensions.some(ext => lowerUri.includes(ext)) || lowerUri.startsWith('data:image/');
  }

  static extractImageMetadata(asset: ImagePicker.ImagePickerAsset): {
    width: number;
    height: number;
    size?: number;
    type?: string;
    aspectRatio: number;
  } {
    return {
      width: asset.width,
      height: asset.height,
      size: asset.fileSize,
      type: asset.type,
      aspectRatio: asset.width / asset.height,
    };
  }
}