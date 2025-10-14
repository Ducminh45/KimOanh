export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static validate(email: string): ValidationResult {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    if (!this.EMAIL_REGEX.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
  }
}

export class PasswordValidator {
  static validate(password: string): ValidationResult {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }

    return { isValid: true };
  }

  static validateConfirmation(password: string, confirmPassword: string): ValidationResult {
    if (!confirmPassword) {
      return { isValid: false, error: 'Please confirm your password' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' };
    }

    return { isValid: true };
  }
}

export class UserMetricsValidator {
  static validateWeight(weight: number): ValidationResult {
    if (!weight || weight <= 0) {
      return { isValid: false, error: 'Weight must be greater than 0' };
    }

    if (weight < 20 || weight > 300) {
      return { isValid: false, error: 'Weight must be between 20 and 300 kg' };
    }

    return { isValid: true };
  }

  static validateHeight(height: number): ValidationResult {
    if (!height || height <= 0) {
      return { isValid: false, error: 'Height must be greater than 0' };
    }

    if (height < 100 || height > 250) {
      return { isValid: false, error: 'Height must be between 100 and 250 cm' };
    }

    return { isValid: true };
  }

  static validateAge(age: number): ValidationResult {
    if (!age || age <= 0) {
      return { isValid: false, error: 'Age must be greater than 0' };
    }

    if (age < 13 || age > 120) {
      return { isValid: false, error: 'Age must be between 13 and 120 years' };
    }

    return { isValid: true };
  }
}

export class FoodValidator {
  static validateServingSize(servingSize: number): ValidationResult {
    if (!servingSize || servingSize <= 0) {
      return { isValid: false, error: 'Serving size must be greater than 0' };
    }

    if (servingSize > 2000) {
      return { isValid: false, error: 'Serving size cannot exceed 2000g' };
    }

    return { isValid: true };
  }

  static validateNutritionValue(value: number, fieldName: string): ValidationResult {
    if (value < 0) {
      return { isValid: false, error: `${fieldName} cannot be negative` };
    }

    if (value > 10000) {
      return { isValid: false, error: `${fieldName} value seems too high` };
    }

    return { isValid: true };
  }
}

export class WaterValidator {
  static validateAmount(amount: number): ValidationResult {
    if (!amount || amount <= 0) {
      return { isValid: false, error: 'Water amount must be greater than 0' };
    }

    if (amount > 2000) {
      return { isValid: false, error: 'Water amount cannot exceed 2000ml at once' };
    }

    return { isValid: true };
  }
}

export class ExerciseValidator {
  static validateDuration(duration: number): ValidationResult {
    if (!duration || duration <= 0) {
      return { isValid: false, error: 'Exercise duration must be greater than 0' };
    }

    if (duration > 480) { // 8 hours
      return { isValid: false, error: 'Exercise duration cannot exceed 8 hours' };
    }

    return { isValid: true };
  }
}

export class FormValidator {
  static validateRequired(value: any, fieldName: string): ValidationResult {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
  }

  static validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
    if (value.length < minLength) {
      return { 
        isValid: false, 
        error: `${fieldName} must be at least ${minLength} characters long` 
      };
    }

    return { isValid: true };
  }

  static validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
    if (value.length > maxLength) {
      return { 
        isValid: false, 
        error: `${fieldName} cannot exceed ${maxLength} characters` 
      };
    }

    return { isValid: true };
  }

  static validatePhoneNumber(phone: string): ValidationResult {
    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Vietnamese phone number regex
    const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8}$/;
    
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, error: 'Please enter a valid Vietnamese phone number' };
    }

    return { isValid: true };
  }

  static validateName(name: string): ValidationResult {
    if (!name || name.trim() === '') {
      return { isValid: false, error: 'Name is required' };
    }

    if (name.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters long' };
    }

    if (name.length > 50) {
      return { isValid: false, error: 'Name cannot exceed 50 characters' };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-ZÀ-ỹ\s\-']+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { isValid: true };
  }
}

export class ImageValidator {
  static validateSize(sizeInBytes: number): ValidationResult {
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (sizeInBytes > maxSize) {
      return { isValid: false, error: 'Image size cannot exceed 5MB' };
    }

    return { isValid: true };
  }

  static validateType(mimeType: string): ValidationResult {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    return { isValid: true };
  }
}

export class DateValidator {
  static validateBirthDate(date: Date): ValidationResult {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    if (date < minDate) {
      return { isValid: false, error: 'Birth date cannot be more than 120 years ago' };
    }

    if (date > maxDate) {
      return { isValid: false, error: 'You must be at least 13 years old' };
    }

    return { isValid: true };
  }

  static validateFutureDate(date: Date): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date <= today) {
      return { isValid: false, error: 'Date must be in the future' };
    }

    return { isValid: true };
  }

  static validatePastDate(date: Date): ValidationResult {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      return { isValid: false, error: 'Date cannot be in the future' };
    }

    return { isValid: true };
  }
}

// Utility function to validate multiple fields
export function validateFields(
  fields: Array<{ value: any; validator: (value: any) => ValidationResult; fieldName?: string }>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of fields) {
    const result = field.validator(field.value);
    if (!result.isValid && result.error) {
      errors.push(result.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}