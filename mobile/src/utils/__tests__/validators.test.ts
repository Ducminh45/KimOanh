import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateHeight,
  validateWeight,
  validateAge,
  validateCalories,
  validateServingSize,
} from '../validators';

describe('Validators Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('Test1234@')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('onlylowercase')).toBe(false);
      expect(validatePassword('ONLYUPPERCASE')).toBe(false);
      expect(validatePassword('NoNumbers!')).toBe(false);
      expect(validatePassword('NoSpecial123')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });

    it('should require minimum length', () => {
      expect(validatePassword('Ab1!')).toBe(false);
      expect(validatePassword('Abcd123!')).toBe(true);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Vietnamese phone numbers', () => {
      expect(validatePhoneNumber('0912345678')).toBe(true);
      expect(validatePhoneNumber('0387654321')).toBe(true);
      expect(validatePhoneNumber('+84912345678')).toBe(true);
      expect(validatePhoneNumber('84912345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('abcdefghij')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
      expect(validatePhoneNumber('012345')).toBe(false);
    });
  });

  describe('validateHeight', () => {
    it('should validate valid heights', () => {
      expect(validateHeight(170)).toBe(true);
      expect(validateHeight(150)).toBe(true);
      expect(validateHeight(200)).toBe(true);
      expect(validateHeight(50)).toBe(true);
    });

    it('should reject invalid heights', () => {
      expect(validateHeight(49)).toBe(false);
      expect(validateHeight(301)).toBe(false);
      expect(validateHeight(0)).toBe(false);
      expect(validateHeight(-10)).toBe(false);
    });
  });

  describe('validateWeight', () => {
    it('should validate valid weights', () => {
      expect(validateWeight(70)).toBe(true);
      expect(validateWeight(50)).toBe(true);
      expect(validateWeight(100)).toBe(true);
      expect(validateWeight(20)).toBe(true);
    });

    it('should reject invalid weights', () => {
      expect(validateWeight(19)).toBe(false);
      expect(validateWeight(501)).toBe(false);
      expect(validateWeight(0)).toBe(false);
      expect(validateWeight(-5)).toBe(false);
    });
  });

  describe('validateAge', () => {
    it('should validate valid ages', () => {
      expect(validateAge(25)).toBe(true);
      expect(validateAge(18)).toBe(true);
      expect(validateAge(60)).toBe(true);
      expect(validateAge(13)).toBe(true);
    });

    it('should reject invalid ages', () => {
      expect(validateAge(12)).toBe(false);
      expect(validateAge(101)).toBe(false);
      expect(validateAge(0)).toBe(false);
      expect(validateAge(-5)).toBe(false);
    });
  });

  describe('validateCalories', () => {
    it('should validate valid calorie amounts', () => {
      expect(validateCalories(500)).toBe(true);
      expect(validateCalories(2000)).toBe(true);
      expect(validateCalories(100)).toBe(true);
      expect(validateCalories(1)).toBe(true);
    });

    it('should reject invalid calorie amounts', () => {
      expect(validateCalories(0)).toBe(false);
      expect(validateCalories(-100)).toBe(false);
      expect(validateCalories(10001)).toBe(false);
    });
  });

  describe('validateServingSize', () => {
    it('should validate valid serving sizes', () => {
      expect(validateServingSize(1)).toBe(true);
      expect(validateServingSize(2.5)).toBe(true);
      expect(validateServingSize(0.5)).toBe(true);
      expect(validateServingSize(0.1)).toBe(true);
    });

    it('should reject invalid serving sizes', () => {
      expect(validateServingSize(0)).toBe(false);
      expect(validateServingSize(-1)).toBe(false);
      expect(validateServingSize(101)).toBe(false);
    });
  });
});
