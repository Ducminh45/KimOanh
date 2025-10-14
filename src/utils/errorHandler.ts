export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

export class ErrorHandler {
  private static errorLog: AppError[] = [];
  private static maxLogSize = 100;

  static createError(
    code: string,
    message: string,
    details?: any,
    originalError?: Error
  ): AppError {
    const error: AppError = {
      code,
      message,
      details,
      timestamp: new Date(),
      stack: originalError?.stack,
    };

    this.logError(error);
    return error;
  }

  static logError(error: AppError): void {
    // Add to local log
    this.errorLog.unshift(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (__DEV__) {
      console.error(`[${error.code}] ${error.message}`, error.details);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  static getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static handleApiError(error: any): AppError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return this.createError(
            'BAD_REQUEST',
            data?.message || 'Yêu cầu không hợp lệ',
            { status, data },
            error
          );
        case 401:
          return this.createError(
            'UNAUTHORIZED',
            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
            { status, data },
            error
          );
        case 403:
          return this.createError(
            'FORBIDDEN',
            'Bạn không có quyền thực hiện thao tác này',
            { status, data },
            error
          );
        case 404:
          return this.createError(
            'NOT_FOUND',
            'Không tìm thấy dữ liệu yêu cầu',
            { status, data },
            error
          );
        case 422:
          return this.createError(
            'VALIDATION_ERROR',
            data?.message || 'Dữ liệu không hợp lệ',
            { status, data, errors: data?.errors },
            error
          );
        case 429:
          return this.createError(
            'RATE_LIMIT',
            'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau',
            { status, data },
            error
          );
        case 500:
          return this.createError(
            'SERVER_ERROR',
            'Lỗi máy chủ. Vui lòng thử lại sau',
            { status, data },
            error
          );
        default:
          return this.createError(
            'API_ERROR',
            data?.message || `Lỗi API (${status})`,
            { status, data },
            error
          );
      }
    } else if (error.request) {
      // Network error
      return this.createError(
        'NETWORK_ERROR',
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet',
        { request: error.request },
        error
      );
    } else {
      // Other error
      return this.createError(
        'UNKNOWN_ERROR',
        error.message || 'Đã xảy ra lỗi không xác định',
        error,
        error
      );
    }
  }

  static handleAuthError(error: any): AppError {
    if (error.code === 'auth/user-not-found') {
      return this.createError(
        'USER_NOT_FOUND',
        'Tài khoản không tồn tại',
        error,
        error
      );
    }

    if (error.code === 'auth/wrong-password') {
      return this.createError(
        'WRONG_PASSWORD',
        'Mật khẩu không chính xác',
        error,
        error
      );
    }

    if (error.code === 'auth/email-already-in-use') {
      return this.createError(
        'EMAIL_IN_USE',
        'Email đã được sử dụng bởi tài khoản khác',
        error,
        error
      );
    }

    if (error.code === 'auth/weak-password') {
      return this.createError(
        'WEAK_PASSWORD',
        'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn',
        error,
        error
      );
    }

    if (error.code === 'auth/invalid-email') {
      return this.createError(
        'INVALID_EMAIL',
        'Địa chỉ email không hợp lệ',
        error,
        error
      );
    }

    if (error.code === 'auth/too-many-requests') {
      return this.createError(
        'TOO_MANY_REQUESTS',
        'Quá nhiều yêu cầu. Vui lòng thử lại sau',
        error,
        error
      );
    }

    return this.createError(
      'AUTH_ERROR',
      error.message || 'Lỗi xác thực',
      error,
      error
    );
  }

  static handleCameraError(error: any): AppError {
    if (error.code === 'permission_denied') {
      return this.createError(
        'CAMERA_PERMISSION_DENIED',
        'Ứng dụng cần quyền truy cập camera để quét thực phẩm',
        error,
        error
      );
    }

    if (error.code === 'camera_unavailable') {
      return this.createError(
        'CAMERA_UNAVAILABLE',
        'Camera không khả dụng. Vui lòng thử lại',
        error,
        error
      );
    }

    return this.createError(
      'CAMERA_ERROR',
      'Lỗi camera. Vui lòng thử lại',
      error,
      error
    );
  }

  static handleStorageError(error: any): AppError {
    if (error.code === 'storage/unauthorized') {
      return this.createError(
        'STORAGE_UNAUTHORIZED',
        'Không có quyền truy cập lưu trữ',
        error,
        error
      );
    }

    if (error.code === 'storage/quota-exceeded') {
      return this.createError(
        'STORAGE_QUOTA_EXCEEDED',
        'Dung lượng lưu trữ đã hết',
        error,
        error
      );
    }

    return this.createError(
      'STORAGE_ERROR',
      'Lỗi lưu trữ dữ liệu',
      error,
      error
    );
  }

  static handleValidationError(errors: Record<string, string[]>): AppError {
    const firstError = Object.values(errors)[0]?.[0];
    return this.createError(
      'VALIDATION_ERROR',
      firstError || 'Dữ liệu không hợp lệ',
      { errors },
    );
  }

  static handleImageError(error: any): AppError {
    if (error.message?.includes('size')) {
      return this.createError(
        'IMAGE_TOO_LARGE',
        'Hình ảnh quá lớn. Vui lòng chọn hình ảnh nhỏ hơn 5MB',
        error,
        error
      );
    }

    if (error.message?.includes('format')) {
      return this.createError(
        'INVALID_IMAGE_FORMAT',
        'Định dạng hình ảnh không được hỗ trợ',
        error,
        error
      );
    }

    return this.createError(
      'IMAGE_ERROR',
      'Lỗi xử lý hình ảnh',
      error,
      error
    );
  }

  static handleGeminiError(error: any): AppError {
    if (error.message?.includes('quota')) {
      return this.createError(
        'GEMINI_QUOTA_EXCEEDED',
        'Đã vượt quá giới hạn sử dụng AI. Vui lòng thử lại sau',
        error,
        error
      );
    }

    if (error.message?.includes('safety')) {
      return this.createError(
        'GEMINI_SAFETY_ERROR',
        'Nội dung không phù hợp với chính sách an toàn',
        error,
        error
      );
    }

    return this.createError(
      'GEMINI_ERROR',
      'Lỗi AI. Vui lòng thử lại',
      error,
      error
    );
  }

  static getErrorMessage(error: any): string {
    if (error instanceof AppError || error.code) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return 'Đã xảy ra lỗi không xác định';
  }

  static isNetworkError(error: AppError): boolean {
    return error.code === 'NETWORK_ERROR';
  }

  static isAuthError(error: AppError): boolean {
    return error.code.includes('AUTH') || error.code === 'UNAUTHORIZED';
  }

  static isValidationError(error: AppError): boolean {
    return error.code === 'VALIDATION_ERROR';
  }

  static shouldRetry(error: AppError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'RATE_LIMIT',
      'GEMINI_QUOTA_EXCEEDED',
    ];
    return retryableCodes.includes(error.code);
  }

  static getRetryDelay(error: AppError, attempt: number): number {
    if (error.code === 'RATE_LIMIT') {
      return 60000; // 1 minute for rate limit
    }

    if (error.code === 'GEMINI_QUOTA_EXCEEDED') {
      return 300000; // 5 minutes for quota exceeded
    }

    // Exponential backoff for other errors
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }

  static formatErrorForUser(error: AppError): {
    title: string;
    message: string;
    action?: string;
  } {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return {
          title: 'Lỗi kết nối',
          message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.',
          action: 'Thử lại',
        };

      case 'UNAUTHORIZED':
        return {
          title: 'Phiên đăng nhập hết hạn',
          message: 'Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.',
          action: 'Đăng nhập',
        };

      case 'CAMERA_PERMISSION_DENIED':
        return {
          title: 'Cần quyền truy cập camera',
          message: 'Ứng dụng cần quyền truy cập camera để quét thực phẩm. Vui lòng cấp quyền trong cài đặt.',
          action: 'Mở cài đặt',
        };

      case 'GEMINI_QUOTA_EXCEEDED':
        return {
          title: 'Vượt quá giới hạn',
          message: 'Bạn đã sử dụng hết lượt quét miễn phí hôm nay. Nâng cấp Premium để quét không giới hạn.',
          action: 'Nâng cấp',
        };

      default:
        return {
          title: 'Đã xảy ra lỗi',
          message: error.message,
          action: 'Đóng',
        };
    }
  }

  static async reportError(error: AppError): Promise<void> {
    try {
      // In a real app, you would send this to your error reporting service
      // like Sentry, Crashlytics, etc.
      
      if (__DEV__) {
        console.log('Error reported:', error);
        return;
      }

      // Example: Send to your API
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}