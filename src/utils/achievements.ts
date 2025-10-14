export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'scanning' | 'nutrition' | 'exercise' | 'social' | 'streak' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

export interface UserStats {
  totalScans: number;
  totalCaloriesLogged: number;
  totalExerciseMinutes: number;
  totalWaterConsumed: number;
  streakDays: number;
  daysActive: number;
  socialPosts: number;
  socialLikes: number;
  challengesCompleted: number;
  recipesViewed: number;
  mealPlansGenerated: number;
  weightLogs: number;
  perfectDays: number; // Days where all goals were met
  registrationDate: Date;
}

export class AchievementSystem {
  private static achievements: Achievement[] = [
    // Scanning Achievements
    {
      id: 'first_scan',
      name: 'Người mới bắt đầu',
      description: 'Thực hiện lần quét đầu tiên',
      icon: '🔍',
      category: 'scanning',
      rarity: 'common',
      points: 10,
    },
    {
      id: 'scanner_novice',
      name: 'Người quét tập sự',
      description: 'Quét 10 món ăn',
      icon: '📱',
      category: 'scanning',
      rarity: 'common',
      points: 25,
    },
    {
      id: 'scanner_expert',
      name: 'Chuyên gia quét',
      description: 'Quét 50 món ăn',
      icon: '🎯',
      category: 'scanning',
      rarity: 'rare',
      points: 100,
    },
    {
      id: 'scanner_master',
      name: 'Bậc thầy quét',
      description: 'Quét 100 món ăn',
      icon: '👑',
      category: 'scanning',
      rarity: 'epic',
      points: 250,
    },
    {
      id: 'scanner_legend',
      name: 'Huyền thoại quét',
      description: 'Quét 500 món ăn',
      icon: '🏆',
      category: 'scanning',
      rarity: 'legendary',
      points: 500,
    },

    // Streak Achievements
    {
      id: 'three_day_streak',
      name: 'Khởi đầu tốt',
      description: 'Duy trì chuỗi 3 ngày',
      icon: '🔥',
      category: 'streak',
      rarity: 'common',
      points: 30,
    },
    {
      id: 'week_warrior',
      name: 'Chiến binh tuần',
      description: 'Duy trì chuỗi 7 ngày',
      icon: '⚡',
      category: 'streak',
      rarity: 'rare',
      points: 75,
    },
    {
      id: 'month_master',
      name: 'Bậc thầy tháng',
      description: 'Duy trì chuỗi 30 ngày',
      icon: '🌟',
      category: 'streak',
      rarity: 'epic',
      points: 300,
    },
    {
      id: 'century_streak',
      name: 'Chuỗi thế kỷ',
      description: 'Duy trì chuỗi 100 ngày',
      icon: '💎',
      category: 'streak',
      rarity: 'legendary',
      points: 1000,
    },

    // Exercise Achievements
    {
      id: 'first_workout',
      name: 'Bước đầu tập luyện',
      description: 'Hoàn thành 30 phút tập luyện đầu tiên',
      icon: '💪',
      category: 'exercise',
      rarity: 'common',
      points: 20,
    },
    {
      id: 'fitness_enthusiast',
      name: 'Người đam mê thể dục',
      description: 'Tích lũy 300 phút tập luyện',
      icon: '🏃',
      category: 'exercise',
      rarity: 'rare',
      points: 150,
    },
    {
      id: 'fitness_champion',
      name: 'Nhà vô địch thể dục',
      description: 'Tích lũy 1000 phút tập luyện',
      icon: '🏅',
      category: 'exercise',
      rarity: 'epic',
      points: 400,
    },
    {
      id: 'iron_will',
      name: 'Ý chí sắt',
      description: 'Tập luyện 30 ngày liên tiếp',
      icon: '🛡️',
      category: 'exercise',
      rarity: 'legendary',
      points: 750,
    },

    // Nutrition Achievements
    {
      id: 'calorie_tracker',
      name: 'Người theo dõi calo',
      description: 'Ghi nhận 1000 calo đầu tiên',
      icon: '📊',
      category: 'nutrition',
      rarity: 'common',
      points: 15,
    },
    {
      id: 'nutrition_guru',
      name: 'Chuyên gia dinh dưỡng',
      description: 'Đạt mục tiêu dinh dưỡng 7 ngày liên tiếp',
      icon: '🥗',
      category: 'nutrition',
      rarity: 'rare',
      points: 200,
    },
    {
      id: 'balanced_diet',
      name: 'Chế độ ăn cân bằng',
      description: 'Duy trì tỷ lệ macro lý tưởng 14 ngày',
      icon: '⚖️',
      category: 'nutrition',
      rarity: 'epic',
      points: 350,
    },
    {
      id: 'hydration_hero',
      name: 'Anh hùng hydrat hóa',
      description: 'Uống đủ 2L nước trong ngày',
      icon: '💧',
      category: 'nutrition',
      rarity: 'common',
      points: 25,
    },
    {
      id: 'water_warrior',
      name: 'Chiến binh nước',
      description: 'Tích lũy 50L nước',
      icon: '🌊',
      category: 'nutrition',
      rarity: 'rare',
      points: 100,
    },

    // Social Achievements
    {
      id: 'social_butterfly',
      name: 'Bướm xã hội',
      description: 'Đăng bài viết đầu tiên',
      icon: '🦋',
      category: 'social',
      rarity: 'common',
      points: 20,
    },
    {
      id: 'community_supporter',
      name: 'Người hỗ trợ cộng đồng',
      description: 'Thích 50 bài viết',
      icon: '❤️',
      category: 'social',
      rarity: 'rare',
      points: 75,
    },
    {
      id: 'influencer',
      name: 'Người có ảnh hưởng',
      description: 'Nhận 100 lượt thích',
      icon: '🌟',
      category: 'social',
      rarity: 'epic',
      points: 300,
    },

    // Milestone Achievements
    {
      id: 'week_active',
      name: 'Tuần tích cực',
      description: 'Hoạt động 7 ngày',
      icon: '📅',
      category: 'milestone',
      rarity: 'common',
      points: 50,
    },
    {
      id: 'month_active',
      name: 'Tháng tích cực',
      description: 'Hoạt động 30 ngày',
      icon: '🗓️',
      category: 'milestone',
      rarity: 'rare',
      points: 200,
    },
    {
      id: 'dedication_master',
      name: 'Bậc thầy cống hiến',
      description: 'Hoạt động 100 ngày',
      icon: '🎖️',
      category: 'milestone',
      rarity: 'epic',
      points: 500,
    },
    {
      id: 'perfect_week',
      name: 'Tuần hoàn hảo',
      description: 'Đạt tất cả mục tiêu trong 7 ngày liên tiếp',
      icon: '✨',
      category: 'milestone',
      rarity: 'epic',
      points: 400,
    },
    {
      id: 'weight_loss_champion',
      name: 'Nhà vô địch giảm cân',
      description: 'Giảm 5kg thành công',
      icon: '🏆',
      category: 'milestone',
      rarity: 'legendary',
      points: 1000,
    },
  ];

  static getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  static getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(achievement => achievement.id === id);
  }

  static getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === category);
  }

  static getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
    return this.achievements.filter(achievement => achievement.rarity === rarity);
  }

  static checkAchievements(userStats: UserStats): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    // Scanning achievements
    if (userStats.totalScans >= 1) {
      unlockedAchievements.push(this.getAchievementById('first_scan')!);
    }
    if (userStats.totalScans >= 10) {
      unlockedAchievements.push(this.getAchievementById('scanner_novice')!);
    }
    if (userStats.totalScans >= 50) {
      unlockedAchievements.push(this.getAchievementById('scanner_expert')!);
    }
    if (userStats.totalScans >= 100) {
      unlockedAchievements.push(this.getAchievementById('scanner_master')!);
    }
    if (userStats.totalScans >= 500) {
      unlockedAchievements.push(this.getAchievementById('scanner_legend')!);
    }

    // Streak achievements
    if (userStats.streakDays >= 3) {
      unlockedAchievements.push(this.getAchievementById('three_day_streak')!);
    }
    if (userStats.streakDays >= 7) {
      unlockedAchievements.push(this.getAchievementById('week_warrior')!);
    }
    if (userStats.streakDays >= 30) {
      unlockedAchievements.push(this.getAchievementById('month_master')!);
    }
    if (userStats.streakDays >= 100) {
      unlockedAchievements.push(this.getAchievementById('century_streak')!);
    }

    // Exercise achievements
    if (userStats.totalExerciseMinutes >= 30) {
      unlockedAchievements.push(this.getAchievementById('first_workout')!);
    }
    if (userStats.totalExerciseMinutes >= 300) {
      unlockedAchievements.push(this.getAchievementById('fitness_enthusiast')!);
    }
    if (userStats.totalExerciseMinutes >= 1000) {
      unlockedAchievements.push(this.getAchievementById('fitness_champion')!);
    }

    // Nutrition achievements
    if (userStats.totalCaloriesLogged >= 1000) {
      unlockedAchievements.push(this.getAchievementById('calorie_tracker')!);
    }
    if (userStats.totalWaterConsumed >= 2000) {
      unlockedAchievements.push(this.getAchievementById('hydration_hero')!);
    }
    if (userStats.totalWaterConsumed >= 50000) {
      unlockedAchievements.push(this.getAchievementById('water_warrior')!);
    }

    // Social achievements
    if (userStats.socialPosts >= 1) {
      unlockedAchievements.push(this.getAchievementById('social_butterfly')!);
    }
    if (userStats.socialLikes >= 50) {
      unlockedAchievements.push(this.getAchievementById('community_supporter')!);
    }

    // Milestone achievements
    if (userStats.daysActive >= 7) {
      unlockedAchievements.push(this.getAchievementById('week_active')!);
    }
    if (userStats.daysActive >= 30) {
      unlockedAchievements.push(this.getAchievementById('month_active')!);
    }
    if (userStats.daysActive >= 100) {
      unlockedAchievements.push(this.getAchievementById('dedication_master')!);
    }

    return unlockedAchievements.filter(Boolean);
  }

  static getNewlyUnlockedAchievements(
    previousStats: UserStats,
    currentStats: UserStats
  ): Achievement[] {
    const previousAchievements = this.checkAchievements(previousStats);
    const currentAchievements = this.checkAchievements(currentStats);

    const previousIds = new Set(previousAchievements.map(a => a.id));
    return currentAchievements.filter(achievement => !previousIds.has(achievement.id));
  }

  static calculateProgress(achievementId: string, userStats: UserStats): {
    current: number;
    target: number;
    percentage: number;
  } {
    const achievement = this.getAchievementById(achievementId);
    if (!achievement) {
      return { current: 0, target: 1, percentage: 0 };
    }

    let current = 0;
    let target = 1;

    switch (achievementId) {
      case 'scanner_novice':
        current = userStats.totalScans;
        target = 10;
        break;
      case 'scanner_expert':
        current = userStats.totalScans;
        target = 50;
        break;
      case 'scanner_master':
        current = userStats.totalScans;
        target = 100;
        break;
      case 'scanner_legend':
        current = userStats.totalScans;
        target = 500;
        break;
      case 'three_day_streak':
        current = userStats.streakDays;
        target = 3;
        break;
      case 'week_warrior':
        current = userStats.streakDays;
        target = 7;
        break;
      case 'month_master':
        current = userStats.streakDays;
        target = 30;
        break;
      case 'century_streak':
        current = userStats.streakDays;
        target = 100;
        break;
      case 'first_workout':
        current = userStats.totalExerciseMinutes;
        target = 30;
        break;
      case 'fitness_enthusiast':
        current = userStats.totalExerciseMinutes;
        target = 300;
        break;
      case 'fitness_champion':
        current = userStats.totalExerciseMinutes;
        target = 1000;
        break;
      case 'calorie_tracker':
        current = userStats.totalCaloriesLogged;
        target = 1000;
        break;
      case 'hydration_hero':
        current = userStats.totalWaterConsumed;
        target = 2000;
        break;
      case 'water_warrior':
        current = userStats.totalWaterConsumed;
        target = 50000;
        break;
      case 'community_supporter':
        current = userStats.socialLikes;
        target = 50;
        break;
      case 'week_active':
        current = userStats.daysActive;
        target = 7;
        break;
      case 'month_active':
        current = userStats.daysActive;
        target = 30;
        break;
      case 'dedication_master':
        current = userStats.daysActive;
        target = 100;
        break;
    }

    const percentage = Math.min(100, Math.round((current / target) * 100));
    return { current, target, percentage };
  }

  static getTotalPoints(achievements: Achievement[]): number {
    return achievements.reduce((total, achievement) => total + achievement.points, 0);
  }

  static getRarityColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common':
        return '#9E9E9E';
      case 'rare':
        return '#2196F3';
      case 'epic':
        return '#9C27B0';
      case 'legendary':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  }

  static getCategoryIcon(category: Achievement['category']): string {
    switch (category) {
      case 'scanning':
        return '🔍';
      case 'nutrition':
        return '🥗';
      case 'exercise':
        return '💪';
      case 'social':
        return '👥';
      case 'streak':
        return '🔥';
      case 'milestone':
        return '🎯';
      default:
        return '🏆';
    }
  }

  static getAchievementsByProgress(userStats: UserStats): {
    unlocked: Achievement[];
    inProgress: (Achievement & { progress: { current: number; target: number; percentage: number } })[];
    locked: Achievement[];
  } {
    const unlockedAchievements = this.checkAchievements(userStats);
    const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

    const allAchievements = this.getAllAchievements();
    const locked: Achievement[] = [];
    const inProgress: (Achievement & { progress: { current: number; target: number; percentage: number } })[] = [];

    allAchievements.forEach(achievement => {
      if (!unlockedIds.has(achievement.id)) {
        const progress = this.calculateProgress(achievement.id, userStats);
        
        if (progress.percentage > 0) {
          inProgress.push({ ...achievement, progress });
        } else {
          locked.push(achievement);
        }
      }
    });

    return {
      unlocked: unlockedAchievements,
      inProgress,
      locked,
    };
  }

  static getRecommendedAchievements(userStats: UserStats, limit: number = 3): Achievement[] {
    const { inProgress } = this.getAchievementsByProgress(userStats);
    
    // Sort by progress percentage (descending) and rarity points
    return inProgress
      .sort((a, b) => {
        if (a.progress.percentage !== b.progress.percentage) {
          return b.progress.percentage - a.progress.percentage;
        }
        return b.points - a.points;
      })
      .slice(0, limit);
  }
}