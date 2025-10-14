export class NumberFormatter {
  static formatCalories(calories: number): string {
    if (calories >= 1000) {
      return `${(calories / 1000).toFixed(1)}k`;
    }
    return Math.round(calories).toString();
  }

  static formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
    if (unit === 'lbs') {
      return `${(weight * 2.20462).toFixed(1)} lbs`;
    }
    return `${weight.toFixed(1)} kg`;
  }

  static formatHeight(height: number, unit: 'cm' | 'ft' = 'cm'): string {
    if (unit === 'ft') {
      const totalInches = height / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${height} cm`;
  }

  static formatVolume(volume: number, unit: 'ml' | 'oz' = 'ml'): string {
    if (unit === 'oz') {
      return `${(volume / 29.5735).toFixed(1)} fl oz`;
    }
    
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}L`;
    }
    return `${volume} ml`;
  }

  static formatMacro(value: number, unit: 'g' | '%' = 'g'): string {
    if (unit === '%') {
      return `${Math.round(value)}%`;
    }
    return `${value.toFixed(1)}g`;
  }

  static formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }

  static formatDecimal(value: number, decimals: number = 1): string {
    return value.toFixed(decimals);
  }

  static formatLargeNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
}

export class CurrencyFormatter {
  static formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  static formatCompactVND(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M VND`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K VND`;
    }
    return `${amount.toLocaleString('vi-VN')} VND`;
  }
}

export class DateFormatter {
  static formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };

    return new Intl.DateTimeFormat('vi-VN', options[format]).format(date);
  }

  static formatTime(date: Date, format: '12h' | '24h' = '24h'): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
    };

    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  }

  static formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} tuần trước`;
    }

    return this.formatDate(date);
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }

    return `${hours} giờ ${remainingMinutes} phút`;
  }

  static formatWeekday(date: Date): string {
    const weekdays = [
      'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 
      'Thứ năm', 'Thứ sáu', 'Thứ bảy'
    ];
    return weekdays[date.getDay()];
  }

  static formatMonth(date: Date): string {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[date.getMonth()];
  }
}

export class TextFormatter {
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static capitalizeWords(text: string): string {
    return text
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Vietnamese phone number
    if (cleaned.startsWith('84')) {
      const number = cleaned.substring(2);
      return `+84 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1);
      return `0${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    
    return phone;
  }

  static formatName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  static initials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

export class NutritionFormatter {
  static formatNutritionLabel(
    value: number, 
    unit: string, 
    dailyValue?: number
  ): { value: string; unit: string; percentage?: string } {
    const formattedValue = value < 1 ? value.toFixed(2) : value.toFixed(1);
    
    const result = {
      value: formattedValue,
      unit,
      percentage: undefined as string | undefined,
    };

    if (dailyValue && dailyValue > 0) {
      result.percentage = `${Math.round((value / dailyValue) * 100)}%`;
    }

    return result;
  }

  static formatServingSize(size: number, unit: string = 'g'): string {
    if (size >= 1000 && unit === 'g') {
      return `${(size / 1000).toFixed(1)} kg`;
    }
    if (size >= 1000 && unit === 'ml') {
      return `${(size / 1000).toFixed(1)} L`;
    }
    return `${size} ${unit}`;
  }

  static formatMealType(mealType: string): string {
    const mealTypes: Record<string, string> = {
      breakfast: 'Sáng',
      lunch: 'Trưa',
      dinner: 'Tối',
      snack: 'Ăn vặt',
    };
    return mealTypes[mealType] || mealType;
  }
}

export class HealthFormatter {
  static formatBMI(bmi: number): { value: string; category: string; color: string } {
    const value = bmi.toFixed(1);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = 'Thiếu cân';
      color = '#3498DB';
    } else if (bmi < 25) {
      category = 'Bình thường';
      color = '#2ECC71';
    } else if (bmi < 30) {
      category = 'Thừa cân';
      color = '#F39C12';
    } else {
      category = 'Béo phì';
      color = '#E74C3C';
    }

    return { value, category, color };
  }

  static formatActivityLevel(level: string): string {
    const levels: Record<string, string> = {
      SEDENTARY: 'Ít vận động',
      LIGHTLY_ACTIVE: 'Vận động nhẹ',
      MODERATELY_ACTIVE: 'Vận động vừa',
      VERY_ACTIVE: 'Vận động nhiều',
      EXTREMELY_ACTIVE: 'Vận động rất nhiều',
    };
    return levels[level] || level;
  }

  static formatGoal(goal: string): string {
    const goals: Record<string, string> = {
      LOSE_WEIGHT: 'Giảm cân',
      MAINTAIN_WEIGHT: 'Duy trì cân nặng',
      GAIN_WEIGHT: 'Tăng cân',
    };
    return goals[goal] || goal;
  }
}

export class SocialFormatter {
  static formatLikes(count: number): string {
    if (count === 0) return '';
    if (count === 1) return '1 lượt thích';
    return `${NumberFormatter.formatLargeNumber(count)} lượt thích`;
  }

  static formatComments(count: number): string {
    if (count === 0) return '';
    if (count === 1) return '1 bình luận';
    return `${NumberFormatter.formatLargeNumber(count)} bình luận`;
  }

  static formatShares(count: number): string {
    if (count === 0) return '';
    if (count === 1) return '1 chia sẻ';
    return `${NumberFormatter.formatLargeNumber(count)} chia sẻ`;
  }

  static formatFollowers(count: number): string {
    if (count === 0) return '0 người theo dõi';
    if (count === 1) return '1 người theo dõi';
    return `${NumberFormatter.formatLargeNumber(count)} người theo dõi`;
  }
}