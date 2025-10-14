export class DateUtils {
  static today(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  static yesterday(): Date {
    const today = this.today();
    return new Date(today.getTime() - 24 * 60 * 60 * 1000);
  }

  static tomorrow(): Date {
    const today = this.today();
    return new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }

  static startOfWeek(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return new Date(d.setDate(diff));
  }

  static endOfWeek(date: Date = new Date()): Date {
    const startOfWeek = this.startOfWeek(date);
    return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  static startOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  static endOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  static startOfYear(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), 0, 1);
  }

  static endOfYear(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), 11, 31);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addWeeks(date: Date, weeks: number): Date {
    return this.addDays(date, weeks * 7);
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static isSameWeek(date1: Date, date2: Date): boolean {
    const startOfWeek1 = this.startOfWeek(date1);
    const startOfWeek2 = this.startOfWeek(date2);
    return this.isSameDay(startOfWeek1, startOfWeek2);
  }

  static isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }

  static isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
  }

  static isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  static isYesterday(date: Date): boolean {
    return this.isSameDay(date, this.yesterday());
  }

  static isTomorrow(date: Date): boolean {
    return this.isSameDay(date, this.tomorrow());
  }

  static isThisWeek(date: Date): boolean {
    return this.isSameWeek(date, new Date());
  }

  static isThisMonth(date: Date): boolean {
    return this.isSameMonth(date, new Date());
  }

  static isThisYear(date: Date): boolean {
    return this.isSameYear(date, new Date());
  }

  static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const secondDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
  }

  static weeksBetween(date1: Date, date2: Date): number {
    return Math.floor(this.daysBetween(date1, date2) / 7);
  }

  static monthsBetween(date1: Date, date2: Date): number {
    const months = (date2.getFullYear() - date1.getFullYear()) * 12;
    return months - date1.getMonth() + date2.getMonth();
  }

  static yearsBetween(date1: Date, date2: Date): number {
    return date2.getFullYear() - date1.getFullYear();
  }

  static getWeekDates(date: Date = new Date()): Date[] {
    const startOfWeek = this.startOfWeek(date);
    const dates: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(this.addDays(startOfWeek, i));
    }
    
    return dates;
  }

  static getMonthDates(date: Date = new Date()): Date[] {
    const start = this.startOfMonth(date);
    const end = this.endOfMonth(date);
    const dates: Date[] = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  }

  static getLast30Days(endDate: Date = new Date()): Date[] {
    const dates: Date[] = [];
    
    for (let i = 29; i >= 0; i--) {
      dates.push(this.addDays(endDate, -i));
    }
    
    return dates;
  }

  static getLast90Days(endDate: Date = new Date()): Date[] {
    const dates: Date[] = [];
    
    for (let i = 89; i >= 0; i--) {
      dates.push(this.addDays(endDate, -i));
    }
    
    return dates;
  }

  static getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  static formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static parseDateKey(dateKey: string): Date {
    return new Date(dateKey + 'T00:00:00.000Z');
  }

  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  static getQuarter(date: Date): number {
    return Math.floor((date.getMonth() + 3) / 3);
  }

  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  static isWeekday(date: Date): boolean {
    return !this.isWeekend(date);
  }

  static getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  static getTimeUntil(targetDate: Date): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const total = target - now;
    
    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, total };
  }

  static getMealTimeCategory(date: Date = new Date()): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snack';
  }

  static getNextMealTime(): { type: string; time: Date } {
    const now = new Date();
    const hour = now.getHours();
    const today = this.today();
    
    if (hour < 8) {
      return {
        type: 'breakfast',
        time: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      };
    } else if (hour < 12) {
      return {
        type: 'lunch',
        time: new Date(today.getTime() + 12 * 60 * 60 * 1000),
      };
    } else if (hour < 18) {
      return {
        type: 'dinner',
        time: new Date(today.getTime() + 18 * 60 * 60 * 1000),
      };
    } else {
      const tomorrow = this.tomorrow();
      return {
        type: 'breakfast',
        time: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000),
      };
    }
  }
}