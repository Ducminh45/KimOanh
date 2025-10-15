import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Get start of current week
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
};

/**
 * Get end of current week
 */
export const getEndOfWeek = (date: Date = new Date()): Date => {
  return endOfWeek(date, { weekStartsOn: 1 });
};

/**
 * Get start of current month
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return startOfMonth(date);
};

/**
 * Get end of current month
 */
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return endOfMonth(date);
};

/**
 * Get date range for period
 */
export const getDateRangeForPeriod = (
  period: 'today' | 'week' | 'month' | '90days'
): { startDate: string; endDate: string } => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date = today;

  switch (period) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      startDate = getStartOfWeek(today);
      endDate = getEndOfWeek(today);
      break;
    case 'month':
      startDate = getStartOfMonth(today);
      endDate = getEndOfMonth(today);
      break;
    case '90days':
      startDate = subDays(today, 90);
      break;
    default:
      startDate = today;
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
};

/**
 * Get last N days
 */
export const getLastNDays = (n: number): Date[] => {
  const days: Date[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    days.push(subDays(today, i));
  }

  return days;
};

/**
 * Format date for display
 */
export const formatDisplayDate = (date: Date | string, useVietnamese: boolean = true): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return useVietnamese ? 'Hôm nay' : 'Today';
  }

  if (isYesterday(dateObj)) {
    return useVietnamese ? 'Hôm qua' : 'Yesterday';
  }

  return format(dateObj, 'dd/MM/yyyy', {
    locale: useVietnamese ? vi : undefined,
  });
};

/**
 * Get day of week label
 */
export const getDayOfWeekLabel = (date: Date | string, short: boolean = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatStr = short ? 'EEE' : 'EEEE';
  return format(dateObj, formatStr, { locale: vi });
};

/**
 * Get week labels (Mon, Tue, Wed, etc.)
 */
export const getWeekLabels = (short: boolean = true): string[] => {
  const startDate = getStartOfWeek();
  const labels: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    labels.push(getDayOfWeekLabel(date, short));
  }

  return labels;
};

/**
 * Check if date is within range
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return dateObj >= startDateObj && dateObj <= endDateObj;
};

/**
 * Get ISO date string (yyyy-MM-dd)
 */
export const getISODateString = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
};

/**
 * Get time from now in Vietnamese
 */
export const getTimeFromNow = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return format(dateObj, 'dd/MM/yyyy');
};

export default {
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDateRangeForPeriod,
  getLastNDays,
  formatDisplayDate,
  getDayOfWeekLabel,
  getWeekLabels,
  isDateInRange,
  getISODateString,
  parseDate,
  getTimeFromNow,
};
