/**
 * Form validation utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Vietnamese phone number: 10 digits starting with 0
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateHeight = (height: number): boolean => {
  return height >= 50 && height <= 300; // cm
};

export const validateWeight = (weight: number): boolean => {
  return weight >= 20 && weight <= 500; // kg
};

export const validateAge = (dateOfBirth: string): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 13 && age <= 120;
};

export const validateCalories = (calories: number): boolean => {
  return calories >= 0 && calories <= 10000;
};

export const validateServingSize = (size: number): boolean => {
  return size > 0 && size <= 100;
};

export default {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateHeight,
  validateWeight,
  validateAge,
  validateCalories,
  validateServingSize,
};
