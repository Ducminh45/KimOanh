import {
  formatNumber,
  formatCalories,
  formatMacros,
  formatWeight,
  formatHeight,
  formatWater,
  formatPercentage,
  formatCurrency,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatDuration,
} from '../formatters';

describe('Formatters Utils', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(500)).toBe('500');
    });

    it('should handle decimals', () => {
      expect(formatNumber(1234.56, 2)).toBe('1,234.56');
      expect(formatNumber(1000.5, 1)).toBe('1,000.5');
    });
  });

  describe('formatCalories', () => {
    it('should format calories', () => {
      expect(formatCalories(500)).toBe('500 kcal');
      expect(formatCalories(1234)).toBe('1,234 kcal');
      expect(formatCalories(0)).toBe('0 kcal');
    });

    it('should handle decimal calories', () => {
      expect(formatCalories(123.45)).toBe('123 kcal');
    });
  });

  describe('formatMacros', () => {
    it('should format macros', () => {
      expect(formatMacros(50)).toBe('50g');
      expect(formatMacros(123.45)).toBe('123g');
      expect(formatMacros(0)).toBe('0g');
    });
  });

  describe('formatWeight', () => {
    it('should format weight in kg', () => {
      expect(formatWeight(70)).toBe('70.0 kg');
      expect(formatWeight(65.5)).toBe('65.5 kg');
    });

    it('should handle different units', () => {
      expect(formatWeight(70, 'lbs')).toBe('154.3 lbs');
      expect(formatWeight(65.5, 'lbs')).toBe('144.4 lbs');
    });
  });

  describe('formatHeight', () => {
    it('should format height in cm', () => {
      expect(formatHeight(170)).toBe('170 cm');
      expect(formatHeight(165.5)).toBe('166 cm');
    });

    it('should handle different units', () => {
      expect(formatHeight(170, 'ft')).toContain('ft');
      expect(formatHeight(165, 'ft')).toContain('ft');
    });
  });

  describe('formatWater', () => {
    it('should format water in ml', () => {
      expect(formatWater(500)).toBe('500 ml');
      expect(formatWater(1000)).toBe('1,000 ml');
    });

    it('should format water in liters', () => {
      expect(formatWater(500, 'L')).toBe('0.5 L');
      expect(formatWater(1500, 'L')).toBe('1.5 L');
      expect(formatWater(2000, 'L')).toBe('2.0 L');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(0.755)).toBe('76%');
      expect(formatPercentage(1.0)).toBe('100%');
      expect(formatPercentage(0)).toBe('0%');
    });
  });

  describe('formatCurrency', () => {
    it('should format VND currency', () => {
      expect(formatCurrency(99000, 'VND')).toBe('99,000 VND');
      expect(formatCurrency(990000, 'VND')).toBe('990,000 VND');
      expect(formatCurrency(1000000, 'VND')).toBe('1,000,000 VND');
    });

    it('should format USD currency', () => {
      expect(formatCurrency(9.99, 'USD')).toBe('$9.99');
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
    });
  });

  describe('formatDate', () => {
    it('should format dates', () => {
      const date = new Date('2025-10-14');
      const formatted = formatDate(date);
      expect(formatted).toContain('2025');
      expect(formatted).toContain('10');
      expect(formatted).toContain('14');
    });
  });

  describe('formatTime', () => {
    it('should format time', () => {
      const date = new Date('2025-10-14T15:30:00');
      const formatted = formatTime(date);
      expect(formatted).toContain('15');
      expect(formatted).toContain('30');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time', () => {
      const now = new Date();
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      expect(formatRelativeTime(fiveMinAgo, true)).toContain('phút');
    });
  });

  describe('formatDuration', () => {
    it('should format duration', () => {
      expect(formatDuration(30)).toBe('30 phút');
      expect(formatDuration(60)).toBe('1 giờ');
      expect(formatDuration(90)).toBe('1 giờ 30 phút');
      expect(formatDuration(120)).toBe('2 giờ');
    });

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0 phút');
    });
  });
});
