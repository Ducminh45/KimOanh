import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LineChart from '@components/charts/LineChart';
import ProgressChart from '@components/charts/ProgressChart';
import Card from '@components/common/Card';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

const ProgressScreen: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | '90days'>('week');
  const [weightData, setWeightData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [70, 69.5, 69.8, 69.2, 69, 68.8, 68.5] }],
  });

  const [calorieData, setCalorieData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [1800, 2100, 1900, 2200, 2000, 1850, 1950] }],
  });

  const [macroProgress, setMacroProgress] = useState({
    labels: ['Protein', 'Carbs', 'Fats'],
    data: [0.85, 0.75, 0.90],
    colors: [Colors.protein, Colors.carbs, Colors.fats],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tiến trình</Text>
          <TouchableOpacity>
            <Ionicons name="calendar-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <PeriodButton
            label="7 ngày"
            active={period === 'week'}
            onPress={() => setPeriod('week')}
          />
          <PeriodButton
            label="30 ngày"
            active={period === 'month'}
            onPress={() => setPeriod('month')}
          />
          <PeriodButton
            label="90 ngày"
            active={period === '90days'}
            onPress={() => setPeriod('90days')}
          />
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <SummaryCard
            icon="💪"
            title="Chuỗi ngày"
            value="12"
            subtitle="ngày liên tiếp"
            color={Colors.primary}
          />
          <SummaryCard
            icon="⚖️"
            title="Giảm cân"
            value="-1.5"
            subtitle="kg tuần này"
            color={Colors.success}
          />
        </View>

        {/* Weight Chart */}
        <LineChart
          title="📊 Biểu đồ cân nặng"
          data={weightData}
          suffix="kg"
          height={200}
        />

        {/* Calorie Chart */}
        <LineChart
          title="🔥 Lượng calories"
          data={calorieData}
          suffix=" kcal"
          height={200}
        />

        {/* Macro Progress */}
        <ProgressChart
          title="📈 Tiến trình Macro"
          chartData={macroProgress}
          height={180}
        />

        {/* Weekly Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📋 Tổng kết tuần này</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="restaurant" size={24} color={Colors.primary} />
              <Text style={styles.summaryValue}>42</Text>
              <Text style={styles.summaryLabel}>Bữa ăn</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="water" size={24} color={Colors.accent} />
              <Text style={styles.summaryValue}>14L</Text>
              <Text style={styles.summaryLabel}>Nước uống</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="barbell" size={24} color={Colors.secondary} />
              <Text style={styles.summaryValue}>5</Text>
              <Text style={styles.summaryLabel}>Tập luyện</Text>
            </View>
          </View>
        </Card>

        {/* Goals */}
        <Card style={styles.goalsCard}>
          <Text style={styles.cardTitle}>🎯 Mục tiêu của bạn</Text>
          <GoalItem
            label="Giảm cân"
            current={68.5}
            target={65}
            unit="kg"
            progress={0.70}
          />
          <GoalItem
            label="BMI"
            current={22.8}
            target={21}
            unit=""
            progress={0.85}
          />
          <GoalItem
            label="Uống nước hàng ngày"
            current={6}
            target={7}
            unit="lần"
            progress={0.86}
          />
        </Card>

        {/* Achievements */}
        <Card style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>🏆 Thành tựu gần đây</Text>
          <View style={styles.achievementsList}>
            <AchievementBadge icon="🔥" title="Chuỗi 7 ngày" />
            <AchievementBadge icon="💧" title="Master nước" />
            <AchievementBadge icon="🍎" title="Ăn sạch" />
            <AchievementBadge icon="💪" title="Gym rat" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const PeriodButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.periodButton, active && styles.periodButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.periodButtonText, active && styles.periodButtonTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SummaryCard: React.FC<{
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}> = ({ icon, title, value, subtitle, color }) => (
  <Card style={[styles.miniCard, { borderLeftWidth: 4, borderLeftColor: color }]}>
    <Text style={styles.miniCardIcon}>{icon}</Text>
    <Text style={styles.miniCardTitle}>{title}</Text>
    <Text style={[styles.miniCardValue, { color }]}>{value}</Text>
    <Text style={styles.miniCardSubtitle}>{subtitle}</Text>
  </Card>
);

const GoalItem: React.FC<{
  label: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
}> = ({ label, current, target, unit, progress }) => (
  <View style={styles.goalItem}>
    <View style={styles.goalHeader}>
      <Text style={styles.goalLabel}>{label}</Text>
      <Text style={styles.goalValue}>
        {current}{unit} / {target}{unit}
      </Text>
    </View>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  </View>
);

const AchievementBadge: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <View style={styles.achievementBadge}>
    <Text style={styles.achievementIcon}>{icon}</Text>
    <Text style={styles.achievementTitle}>{title}</Text>
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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: Colors.text,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  miniCard: {
    flex: 1,
    alignItems: 'center',
  },
  miniCardIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  miniCardTitle: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  miniCardValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginVertical: spacing.xs,
  },
  miniCardSubtitle: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  goalsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  goalItem: {
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  goalLabel: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  goalValue: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: borderRadius.full,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.full,
  },
  achievementsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementBadge: {
    width: '22%',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.md,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    fontSize: fontSize.xs,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default ProgressScreen;
