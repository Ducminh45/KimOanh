import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Toast from 'react-native-toast-message';

interface MealPlanDay {
  day: number;
  dayName: string;
  meals: {
    breakfast: { name: string; calories: number };
    lunch: { name: string; calories: number };
    dinner: { name: string; calories: number };
    snacks: { name: string; calories: number }[];
  };
  totalCalories: number;
}

const MealPlannerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const weekDays = [
    { day: 1, label: 'T2', fullName: 'Thứ Hai' },
    { day: 2, label: 'T3', fullName: 'Thứ Ba' },
    { day: 3, label: 'T4', fullName: 'Thứ Tư' },
    { day: 4, label: 'T5', fullName: 'Thứ Năm' },
    { day: 5, label: 'T6', fullName: 'Thứ Sáu' },
    { day: 6, label: 'T7', fullName: 'Thứ Bảy' },
    { day: 7, label: 'CN', fullName: 'Chủ Nhật' },
  ];

  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([
    {
      day: 1,
      dayName: 'Thứ Hai',
      meals: {
        breakfast: { name: 'Phở gà', calories: 350 },
        lunch: { name: 'Cơm gà xối mỡ', calories: 480 },
        dinner: { name: 'Bún chả', calories: 450 },
        snacks: [{ name: 'Sữa chua', calories: 120 }],
      },
      totalCalories: 1400,
    },
    {
      day: 2,
      dayName: 'Thứ Ba',
      meals: {
        breakfast: { name: 'Bánh mì trứng', calories: 300 },
        lunch: { name: 'Cơm sườn nướng', calories: 520 },
        dinner: { name: 'Bún bò Huế', calories: 480 },
        snacks: [{ name: 'Trái cây', calories: 100 }],
      },
      totalCalories: 1400,
    },
    {
      day: 3,
      dayName: 'Thứ Tư',
      meals: {
        breakfast: { name: 'Xôi gà', calories: 380 },
        lunch: { name: 'Mì Quảng', calories: 460 },
        dinner: { name: 'Canh chua cá', calories: 350 },
        snacks: [{ name: 'Hạt điều', calories: 150 }],
      },
      totalCalories: 1340,
    },
  ]);

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      Toast.show({
        type: 'success',
        text1: 'Đã tạo thực đơn',
        text2: 'Thực đơn AI của bạn đã sẵn sàng!',
      });
    }, 2000);
  };

  const currentDayPlan = mealPlan.find((d) => d.day === selectedDay);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Kế hoạch bữa ăn</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MealPlanSettings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Week Overview */}
        <Card style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>📅 Tuần này</Text>
            <Button
              title="Tạo bằng AI"
              onPress={handleGenerateAIPlan}
              loading={isGenerating}
              size="small"
              icon={<Ionicons name="sparkles" size={16} color={Colors.white} />}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.daysContainer}>
              {weekDays.map((day) => (
                <TouchableOpacity
                  key={day.day}
                  style={[
                    styles.dayButton,
                    selectedDay === day.day && styles.dayButtonActive,
                  ]}
                  onPress={() => setSelectedDay(day.day)}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      selectedDay === day.day && styles.dayLabelActive,
                    ]}
                  >
                    {day.label}
                  </Text>
                  <View
                    style={[
                      styles.dayIndicator,
                      mealPlan.some((p) => p.day === day.day) && styles.dayIndicatorFilled,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* Current Day Plan */}
        {currentDayPlan ? (
          <>
            {/* Day Summary */}
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {currentDayPlan.dayName}
              </Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentDayPlan.totalCalories}</Text>
                  <Text style={styles.statLabel}>kcal</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>4</Text>
                  <Text style={styles.statLabel}>bữa</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>100%</Text>
                  <Text style={styles.statLabel}>cân bằng</Text>
                </View>
              </View>
            </Card>

            {/* Meals */}
            <View style={styles.mealsSection}>
              <MealCard
                icon="🌅"
                title="Bữa sáng"
                meal={currentDayPlan.meals.breakfast}
                color={Colors.breakfast}
                onPress={() =>
                  navigation.navigate('MealDetail', {
                    meal: currentDayPlan.meals.breakfast,
                    type: 'breakfast',
                  })
                }
              />
              <MealCard
                icon="☀️"
                title="Bữa trưa"
                meal={currentDayPlan.meals.lunch}
                color={Colors.lunch}
                onPress={() =>
                  navigation.navigate('MealDetail', {
                    meal: currentDayPlan.meals.lunch,
                    type: 'lunch',
                  })
                }
              />
              <MealCard
                icon="🌙"
                title="Bữa tối"
                meal={currentDayPlan.meals.dinner}
                color={Colors.dinner}
                onPress={() =>
                  navigation.navigate('MealDetail', {
                    meal: currentDayPlan.meals.dinner,
                    type: 'dinner',
                  })
                }
              />
              {currentDayPlan.meals.snacks.map((snack, index) => (
                <MealCard
                  key={index}
                  icon="🍎"
                  title={`Bữa phụ ${index + 1}`}
                  meal={snack}
                  color={Colors.snack}
                  onPress={() => {}}
                />
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Button
                title="Thêm bữa ăn"
                variant="outline"
                fullWidth
                icon={<Ionicons name="add" size={20} color={Colors.primary} />}
                onPress={() => navigation.navigate('AddMeal')}
              />
              <Button
                title="Xem công thức"
                variant="outline"
                fullWidth
                icon={<Ionicons name="book" size={20} color={Colors.primary} />}
                onPress={() => navigation.navigate('Recipes')}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>Chưa có thực đơn</Text>
            <Text style={styles.emptyText}>
              Hãy tạo thực đơn bằng AI hoặc thêm thủ công
            </Text>
            <Button
              title="Tạo thực đơn AI"
              onPress={handleGenerateAIPlan}
              loading={isGenerating}
              icon={<Ionicons name="sparkles" size={20} color={Colors.white} />}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Mẹo lập kế hoạch</Text>
          <Text style={styles.tipsText}>
            • Chuẩn bị thực đơn tuần trước{'\n'}
            • Đa dạng món ăn mỗi ngày{'\n'}
            • Cân đối dinh dưỡng{'\n'}
            • Mua sắm theo danh sách
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const MealCard: React.FC<{
  icon: string;
  title: string;
  meal: { name: string; calories: number };
  color: string;
  onPress: () => void;
}> = ({ icon, title, meal, color, onPress }) => (
  <Card style={styles.mealCard} onPress={onPress}>
    <View style={[styles.mealIconContainer, { backgroundColor: color + '20' }]}>
      <Text style={styles.mealIcon}>{icon}</Text>
    </View>
    <View style={styles.mealInfo}>
      <Text style={styles.mealTitle}>{title}</Text>
      <Text style={styles.mealName}>{meal.name}</Text>
      <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
  </Card>
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
  weekCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.md,
    minWidth: 60,
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  dayLabelActive: {
    color: Colors.white,
  },
  dayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray300,
  },
  dayIndicatorFilled: {
    backgroundColor: Colors.success,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray300,
  },
  mealsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  mealName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  mealCalories: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: Colors.primary + '10',
  },
  tipsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default MealPlannerScreen;
