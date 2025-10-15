import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  calculateMacros,
  calculateIdealWeightRange,
  calculateWaterGoal,
  calculateTimeToGoal,
  calculateCaloriesBurned,
  calculateProgressPercentage,
  calculateAge,
  getBMICategory,
} from '../calculations';

describe('Calculations Utils', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      expect(calculateBMI(70, 170)).toBe(24.2);
      expect(calculateBMI(65, 160)).toBe(25.4);
      expect(calculateBMI(80, 180)).toBe(24.7);
    });

    it('should handle edge cases', () => {
      expect(calculateBMI(0, 170)).toBe(0);
      expect(calculateBMI(70, 0)).toBe(0);
    });
  });

  describe('calculateBMR', () => {
    it('should calculate BMR for male', () => {
      const bmr = calculateBMR(70, 170, 25, 'male');
      expect(bmr).toBeGreaterThan(1500);
      expect(bmr).toBeLessThan(2000);
    });

    it('should calculate BMR for female', () => {
      const bmr = calculateBMR(60, 160, 25, 'female');
      expect(bmr).toBeGreaterThan(1200);
      expect(bmr).toBeLessThan(1600);
    });

    it('should calculate different BMR for different ages', () => {
      const bmr25 = calculateBMR(70, 170, 25, 'male');
      const bmr50 = calculateBMR(70, 170, 50, 'male');
      expect(bmr25).toBeGreaterThan(bmr50);
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE with different activity levels', () => {
      const bmr = 1650;
      
      expect(calculateTDEE(bmr, 'sedentary')).toBe(1980);
      expect(calculateTDEE(bmr, 'lightly_active')).toBe(2268);
      expect(calculateTDEE(bmr, 'moderately_active')).toBe(2558);
      expect(calculateTDEE(bmr, 'very_active')).toBe(2848);
      expect(calculateTDEE(bmr, 'extra_active')).toBe(3135);
    });
  });

  describe('calculateCalorieGoal', () => {
    it('should calculate calorie goal for weight loss', () => {
      const tdee = 2500;
      expect(calculateCalorieGoal(tdee, 'lose_weight')).toBe(2000);
    });

    it('should calculate calorie goal for weight gain', () => {
      const tdee = 2500;
      expect(calculateCalorieGoal(tdee, 'gain_weight')).toBe(3000);
    });

    it('should maintain TDEE for maintenance', () => {
      const tdee = 2500;
      expect(calculateCalorieGoal(tdee, 'maintain_weight')).toBe(2500);
    });

    it('should calculate calorie goal for muscle building', () => {
      const tdee = 2500;
      expect(calculateCalorieGoal(tdee, 'build_muscle')).toBe(2750);
    });
  });

  describe('calculateMacros', () => {
    it('should calculate macros for weight loss', () => {
      const macros = calculateMacros(2000, 'lose_weight');
      
      expect(macros.protein).toBe(175);
      expect(macros.fats).toBe(56);
      expect(macros.carbs).toBe(188);
    });

    it('should calculate macros for muscle building', () => {
      const macros = calculateMacros(2500, 'build_muscle');
      
      expect(macros.protein).toBe(250);
      expect(macros.fats).toBe(69);
      expect(macros.carbs).toBe(250);
    });

    it('should have correct calorie distribution', () => {
      const macros = calculateMacros(2000, 'lose_weight');
      const totalCalories = (macros.protein * 4) + (macros.carbs * 4) + (macros.fats * 9);
      
      expect(totalCalories).toBeCloseTo(2000, 0);
    });
  });

  describe('calculateIdealWeightRange', () => {
    it('should calculate ideal weight range', () => {
      const range = calculateIdealWeightRange(170);
      
      expect(range.min).toBe(53.5);
      expect(range.max).toBe(72.3);
    });

    it('should handle different heights', () => {
      const range160 = calculateIdealWeightRange(160);
      const range180 = calculateIdealWeightRange(180);
      
      expect(range180.min).toBeGreaterThan(range160.min);
      expect(range180.max).toBeGreaterThan(range160.max);
    });
  });

  describe('calculateWaterGoal', () => {
    it('should calculate base water goal from weight', () => {
      expect(calculateWaterGoal(70, 'sedentary')).toBe(2450);
    });

    it('should increase water goal for active levels', () => {
      const sedentary = calculateWaterGoal(70, 'sedentary');
      const veryActive = calculateWaterGoal(70, 'very_active');
      
      expect(veryActive).toBeGreaterThan(sedentary);
    });
  });

  describe('calculateTimeToGoal', () => {
    it('should calculate time to lose weight', () => {
      const weeks = calculateTimeToGoal(80, 70, 'lose_weight');
      expect(weeks).toBeGreaterThan(0);
      expect(weeks).toBeLessThan(100);
    });

    it('should calculate time to gain weight', () => {
      const weeks = calculateTimeToGoal(60, 70, 'gain_weight');
      expect(weeks).toBeGreaterThan(0);
      expect(weeks).toBeLessThan(100);
    });

    it('should return 0 for maintenance', () => {
      expect(calculateTimeToGoal(70, 70, 'maintain_weight')).toBe(0);
    });
  });

  describe('calculateCaloriesBurned', () => {
    it('should calculate calories burned', () => {
      const calories = calculateCaloriesBurned('running', 30, 70, 'high');
      expect(calories).toBeGreaterThan(200);
      expect(calories).toBeLessThan(600);
    });

    it('should vary by intensity', () => {
      const low = calculateCaloriesBurned('running', 30, 70, 'low');
      const high = calculateCaloriesBurned('running', 30, 70, 'high');
      
      expect(high).toBeGreaterThan(low);
    });
  });

  describe('calculateProgressPercentage', () => {
    it('should calculate progress percentage', () => {
      expect(calculateProgressPercentage(500, 1000)).toBe(50);
      expect(calculateProgressPercentage(1000, 1000)).toBe(100);
      expect(calculateProgressPercentage(0, 1000)).toBe(0);
    });

    it('should cap at 100%', () => {
      expect(calculateProgressPercentage(1500, 1000)).toBe(100);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age from date string', () => {
      const birthDate = '1995-01-01';
      const age = calculateAge(birthDate);
      
      expect(age).toBeGreaterThan(25);
      expect(age).toBeLessThan(35);
    });
  });

  describe('getBMICategory', () => {
    it('should categorize underweight', () => {
      const category = getBMICategory(17);
      expect(category.category).toBe('underweight');
      expect(category.categoryVi).toBe('Thiếu cân');
    });

    it('should categorize normal', () => {
      const category = getBMICategory(22);
      expect(category.category).toBe('normal');
      expect(category.categoryVi).toBe('Bình thường');
    });

    it('should categorize overweight', () => {
      const category = getBMICategory(27);
      expect(category.category).toBe('overweight');
      expect(category.categoryVi).toBe('Thừa cân');
    });

    it('should categorize obese', () => {
      const category = getBMICategory(32);
      expect(category.category).toBe('obese');
      expect(category.categoryVi).toBe('Béo phì');
    });
  });
});
