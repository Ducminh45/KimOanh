import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

export type PermissionType = 'camera' | 'mediaLibrary' | 'notifications';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export class PermissionManager {
  static async requestCameraPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  static async getCameraPermissionStatus(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error getting camera permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  static async requestMediaLibraryPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  static async getMediaLibraryPermissionStatus(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error getting media library permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  static async requestNotificationPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  static async getNotificationPermissionStatus(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error getting notification permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  static async requestPermission(type: PermissionType): Promise<PermissionStatus> {
    switch (type) {
      case 'camera':
        return this.requestCameraPermission();
      case 'mediaLibrary':
        return this.requestMediaLibraryPermission();
      case 'notifications':
        return this.requestNotificationPermission();
      default:
        throw new Error(`Unknown permission type: ${type}`);
    }
  }

  static async getPermissionStatus(type: PermissionType): Promise<PermissionStatus> {
    switch (type) {
      case 'camera':
        return this.getCameraPermissionStatus();
      case 'mediaLibrary':
        return this.getMediaLibraryPermissionStatus();
      case 'notifications':
        return this.getNotificationPermissionStatus();
      default:
        throw new Error(`Unknown permission type: ${type}`);
    }
  }

  static async ensurePermission(type: PermissionType): Promise<boolean> {
    const status = await this.getPermissionStatus(type);
    
    if (status.granted) {
      return true;
    }

    if (status.canAskAgain) {
      const requestResult = await this.requestPermission(type);
      return requestResult.granted;
    }

    // Permission was denied and can't ask again
    this.showPermissionDeniedAlert(type);
    return false;
  }

  static showPermissionDeniedAlert(type: PermissionType): void {
    const permissionInfo = this.getPermissionInfo(type);
    
    Alert.alert(
      permissionInfo.title,
      permissionInfo.message,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Mở cài đặt',
          onPress: () => this.openSettings(),
        },
      ]
    );
  }

  static getPermissionInfo(type: PermissionType): {
    title: string;
    message: string;
  } {
    switch (type) {
      case 'camera':
        return {
          title: 'Cần quyền truy cập camera',
          message: 'NutriScanVN cần quyền truy cập camera để quét thực phẩm. Vui lòng cấp quyền trong cài đặt ứng dụng.',
        };
      case 'mediaLibrary':
        return {
          title: 'Cần quyền truy cập thư viện ảnh',
          message: 'NutriScanVN cần quyền truy cập thư viện ảnh để chọn hình ảnh thực phẩm. Vui lòng cấp quyền trong cài đặt ứng dụng.',
        };
      case 'notifications':
        return {
          title: 'Cần quyền gửi thông báo',
          message: 'NutriScanVN cần quyền gửi thông báo để nhắc nhở bạn về bữa ăn và uống nước. Vui lòng cấp quyền trong cài đặt ứng dụng.',
        };
      default:
        return {
          title: 'Cần quyền truy cập',
          message: 'Ứng dụng cần quyền truy cập để hoạt động bình thường.',
        };
    }
  }

  static async openSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }

  static async checkAllPermissions(): Promise<{
    camera: PermissionStatus;
    mediaLibrary: PermissionStatus;
    notifications: PermissionStatus;
  }> {
    const [camera, mediaLibrary, notifications] = await Promise.all([
      this.getCameraPermissionStatus(),
      this.getMediaLibraryPermissionStatus(),
      this.getNotificationPermissionStatus(),
    ]);

    return {
      camera,
      mediaLibrary,
      notifications,
    };
  }

  static async requestAllPermissions(): Promise<{
    camera: PermissionStatus;
    mediaLibrary: PermissionStatus;
    notifications: PermissionStatus;
  }> {
    const [camera, mediaLibrary, notifications] = await Promise.all([
      this.requestCameraPermission(),
      this.requestMediaLibraryPermission(),
      this.requestNotificationPermission(),
    ]);

    return {
      camera,
      mediaLibrary,
      notifications,
    };
  }

  static async hasAllRequiredPermissions(): Promise<boolean> {
    const permissions = await this.checkAllPermissions();
    return permissions.camera.granted && permissions.mediaLibrary.granted;
  }

  static async requestRequiredPermissions(): Promise<boolean> {
    const cameraPermission = await this.ensurePermission('camera');
    const mediaLibraryPermission = await this.ensurePermission('mediaLibrary');
    
    return cameraPermission && mediaLibraryPermission;
  }

  static async shouldShowPermissionRationale(type: PermissionType): Promise<boolean> {
    const status = await this.getPermissionStatus(type);
    return !status.granted && status.canAskAgain;
  }

  static showPermissionRationale(
    type: PermissionType,
    onAccept: () => void,
    onDecline?: () => void
  ): void {
    const permissionInfo = this.getPermissionInfo(type);
    const rationaleMessage = this.getRationaleMessage(type);
    
    Alert.alert(
      permissionInfo.title,
      rationaleMessage,
      [
        {
          text: 'Không',
          style: 'cancel',
          onPress: onDecline,
        },
        {
          text: 'Cấp quyền',
          onPress: onAccept,
        },
      ]
    );
  }

  static getRationaleMessage(type: PermissionType): string {
    switch (type) {
      case 'camera':
        return 'Để quét và nhận diện thực phẩm, ứng dụng cần quyền truy cập camera của bạn. Điều này giúp bạn dễ dàng theo dõi dinh dưỡng hàng ngày.';
      case 'mediaLibrary':
        return 'Để chọn hình ảnh thực phẩm từ thư viện, ứng dụng cần quyền truy cập ảnh của bạn. Bạn có thể chọn ảnh đã chụp trước đó để phân tích dinh dưỡng.';
      case 'notifications':
        return 'Để nhắc nhở bạn về bữa ăn, uống nước và các mục tiêu sức khỏe, ứng dụng cần quyền gửi thông báo. Điều này giúp bạn duy trì thói quen ăn uống lành mạnh.';
      default:
        return 'Ứng dụng cần quyền này để hoạt động tốt nhất và mang lại trải nghiệm tốt nhất cho bạn.';
    }
  }

  static async requestPermissionWithRationale(type: PermissionType): Promise<boolean> {
    const shouldShowRationale = await this.shouldShowPermissionRationale(type);
    
    if (shouldShowRationale) {
      return new Promise((resolve) => {
        this.showPermissionRationale(
          type,
          async () => {
            const result = await this.requestPermission(type);
            resolve(result.granted);
          },
          () => resolve(false)
        );
      });
    } else {
      const result = await this.requestPermission(type);
      return result.granted;
    }
  }

  static getPermissionStatusText(status: PermissionStatus): string {
    if (status.granted) {
      return 'Đã cấp quyền';
    }

    switch (status.status) {
      case 'denied':
        return status.canAskAgain ? 'Bị từ chối' : 'Bị từ chối vĩnh viễn';
      case 'undetermined':
        return 'Chưa xác định';
      default:
        return 'Không xác định';
    }
  }

  static isPermissionPermanentlyDenied(status: PermissionStatus): boolean {
    return !status.granted && !status.canAskAgain && status.status === 'denied';
  }
}