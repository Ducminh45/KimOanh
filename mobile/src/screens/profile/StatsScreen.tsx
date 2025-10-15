import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import LineChart from '@components/charts/LineChart';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import userApi from '@services/api/userApi';

const StatsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [stats, setStats] = useState({
    streakCount: 12,
    totalMealsLogged: 156,
    totalWaterLogs: 84,
    totalExercises: 32,
    totalPosts: 8,
    followingCount: 24,
    followersCount: 18,
    achievementsCount: 6,
    totalPoints: 850,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await userApi.getUserStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const statsCards = [
    { icon: '🔥', label: 'Chuỗi ngày', value: stats.streakCount, color: Colors.error },
    { icon: '🍽️', label: 'Bữa ăn', value: stats.totalMealsLogged, color: Colors.primary },
    { icon: '💧', label: 'Nước uống', value: stats.totalWaterLogs, color: Colors.accent },
    { icon: '💪', label: 'Tập luyện', value: stats.totalExercises, color: Colors.secondary },
    { icon: '📱', label: 'Bài viết', value: stats.totalPosts, color: Colors.protein },
    { icon: '🏆', label: 'Thành tựu', value: stats.achievementsCount, color: Colors.warning },
  ];

  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [5, 8, 6, 9, 7, 10, 8] }],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Thống kê</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Points Card */}
        <Card style={styles.pointsCard}>
          <View style={styles.pointsContent}>
            <View>
              <Text style={styles.pointsLabel}>Tổng điểm</Text>
              <Text style={styles.pointsValue}>{stats.totalPoints}</Text>
            </View>
            <Text style={styles.pointsIcon}>⭐</Text>
          </View>
          <View style={styles.rankInfo}>
            <Ionicons name="trophy" size={20} color={Colors.secondary} />
            <Text style={styles.rankText}>Hạng: Bạc</Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Social Stats */}
        <Card style={styles.socialCard}>
          <Text style={styles.sectionTitle}>Mạng xã hội</Text>
          <View style={styles.socialStats}>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatValue}>{stats.followingCount}</Text>
              <Text style={styles.socialStatLabel}>Đang theo dõi</Text>
            </View>
            <View style={styles.socialDivider} />
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatValue}>{stats.followersCount}</Text>
              <Text style={styles.socialStatLabel}>Người theo dõi</Text>
            </View>
          </View>
        </Card>

        {/* Activity Chart */}
        <LineChart
          title="📈 Hoạt động tuần này"
          data={activityData}
          suffix=" hoạt động"
          height={200}
        />

        {/* Achievements Preview */}
        <Card style={styles.achievementsCard}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>🏆 Thành tựu</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsList}>
            <AchievementBadge icon="🔥" label="Week Warrior" />
            <AchievementBadge icon="💧" label="Hydration Hero" />
            <AchievementBadge icon="🍽️" label="First Meal" />
            <AchievementBadge icon="💪" label="Fitness Fan" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const AchievementBadge: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <View style={styles.achievementBadge}>
    <View style={styles.achievementIconContainer}>
      <Text style={styles.achievementIcon}>{icon}</Text>
    </View>
    <Text style={styles.achievementLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  pointsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: Colors.primary + '10',
  },
  pointsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pointsLabel: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
  pointsValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  pointsIcon: {
    fontSize: 48,
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankText: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '31%',
    alignItems: 'center',
    padding: spacing.md,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  socialCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  socialStats: {
    flexDirection: 'row',
  },
  socialStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  socialStatValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  socialStatLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  socialDivider: {
    width: 1,
    backgroundColor: Colors.gray300,
  },
  achievementsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: fontWeight.medium,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementBadge: {
    width: '22%',
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementLabel: {
    fontSize: fontSize.xs,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default StatsScreen;
