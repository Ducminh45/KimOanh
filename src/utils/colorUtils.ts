export class ColorUtils {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  static hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  static hslToHex(h: number, s: number, l: number): string {
    const rgb = this.hslToRgb(h, s, l);
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  static lighten(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    hsl.l = Math.min(100, hsl.l + amount);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  static darken(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    hsl.l = Math.max(0, hsl.l - amount);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  static saturate(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    hsl.s = Math.min(100, hsl.s + amount);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  static desaturate(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    hsl.s = Math.max(0, hsl.s - amount);
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  static adjustHue(color: string, amount: number): string {
    const hsl = this.hexToHsl(color);
    if (!hsl) return color;

    hsl.h = (hsl.h + amount) % 360;
    if (hsl.h < 0) hsl.h += 360;
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  static getContrastColor(backgroundColor: string): string {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      const rgb = this.hexToRgb(color);
      if (!rgb) return 0;

      const sRGB = [rgb.r, rgb.g, rgb.b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  static isAccessible(backgroundColor: string, textColor: string): boolean {
    const contrastRatio = this.getContrastRatio(backgroundColor, textColor);
    return contrastRatio >= 4.5; // WCAG AA standard
  }

  static addAlpha(color: string, alpha: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  static blendColors(color1: string, color2: string, ratio: number = 0.5): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

    return this.rgbToHex(r, g, b);
  }

  static generateColorPalette(baseColor: string, count: number = 5): string[] {
    const hsl = this.hexToHsl(baseColor);
    if (!hsl) return [baseColor];

    const colors: string[] = [];
    const lightnessStep = 80 / (count - 1);

    for (let i = 0; i < count; i++) {
      const lightness = 10 + i * lightnessStep;
      colors.push(this.hslToHex(hsl.h, hsl.s, lightness));
    }

    return colors;
  }

  static generateComplementaryColor(color: string): string {
    return this.adjustHue(color, 180);
  }

  static generateTriadicColors(color: string): [string, string] {
    return [this.adjustHue(color, 120), this.adjustHue(color, 240)];
  }

  static generateAnalogousColors(color: string): [string, string] {
    return [this.adjustHue(color, 30), this.adjustHue(color, -30)];
  }

  static generateSplitComplementaryColors(color: string): [string, string] {
    return [this.adjustHue(color, 150), this.adjustHue(color, 210)];
  }

  static isValidHex(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  static randomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  static getColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - color.length) + color;
  }

  static getBMIColor(bmi: number): string {
    if (bmi < 18.5) return '#3498DB'; // Blue - Underweight
    if (bmi < 25) return '#2ECC71'; // Green - Normal
    if (bmi < 30) return '#F39C12'; // Orange - Overweight
    return '#E74C3C'; // Red - Obese
  }

  static getMacroColor(macroType: 'protein' | 'carbs' | 'fat' | 'fiber'): string {
    const colors = {
      protein: '#4ECDC4',
      carbs: '#45B7D1',
      fat: '#FFA07A',
      fiber: '#98D8C8',
    };
    return colors[macroType];
  }

  static getProgressColor(percentage: number): string {
    if (percentage < 25) return '#E74C3C'; // Red
    if (percentage < 50) return '#F39C12'; // Orange
    if (percentage < 75) return '#F1C40F'; // Yellow
    if (percentage < 90) return '#2ECC71'; // Green
    return '#27AE60'; // Dark Green
  }

  static getIntensityColor(intensity: 'low' | 'medium' | 'high'): string {
    const colors = {
      low: '#3498DB',
      medium: '#F39C12',
      high: '#E74C3C',
    };
    return colors[intensity];
  }

  static getGradientColors(color: string): [string, string] {
    const lightColor = this.lighten(color, 20);
    const darkColor = this.darken(color, 10);
    return [lightColor, darkColor];
  }
}