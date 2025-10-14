import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@store/authStore';
import { useFoodStore } from '@store/foodStore';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { dailyNutrition, getDailyNutrition } = useFoodStore();

  useEffect(() => {
    getDailyNutrition();
  }, []);

  const nutrition = dailyNutrition?.nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const goals = dailyNutrition?.goals || { calories: 2000, protein: 150, carbs: 225, fats: 67 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Xin chào, {user?.fullName || 'User'}! 👋</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('vi-VN')}</Text>
        </View>

        {/* Calorie Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calories hôm nay</Text>
          <View style={styles.calorieProgress}>
            <Text style={styles.calorieValue}>{nutrition.calories}</Text>
            <Text style={styles.calorieGoal}>/ {goals.calories} kcal</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((nutrition.calories / goals.calories) * 100, 100)}%` }]} />
          </View>
        </View>

        {/* Macros */}
        <View style={styles.macrosGrid}>
          <View style={[styles.macroCard, { borderLeftColor: Colors.protein }]}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{nutrition.protein}g</Text>
            <Text style={styles.macroGoal}>/ {goals.protein}g</Text>
          </View>
          <View style={[styles.macroCard, { borderLeftColor: Colors.carbs }]}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{nutrition.carbs}g</Text>
            <Text style={styles.macroGoal}>/ {goals.carbs}g</Text>
          </View>
          <View style={[styles.macroCard, { borderLeftColor: Colors.fats }]}>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroValue}>{nutrition.fats}g</Text>
            <Text style={styles.macroGoal}>/ {goals.fats}g</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🍽️</Text>
              <Text style={styles.actionLabel}>Thêm món</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💧</Text>
              <Text style={styles.actionLabel}>Uống nước</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💪</Text>
              <Text style={styles.actionLabel}>Tập luyện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⚖️</Text>
              <Text style={styles.actionLabel}>Cân nặng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: spacing.lg },
  greeting: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: Colors.text },
  date: { fontSize: fontSize.md, color: Colors.textSecondary, marginTop: spacing.xs },
  card: { margin: spacing.lg, padding: spacing.lg, backgroundColor: Colors.white, borderRadius: borderRadius.lg },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  calorieProgress: { flexDirection: 'row', alignItems: 'baseline' },
  calorieValue: { fontSize: 48, fontWeight: fontWeight.bold, color: Colors.primary },
  calorieGoal: { fontSize: fontSize.lg, color: Colors.textSecondary, marginLeft: spacing.sm },
  progressBar: { height: 8, backgroundColor: Colors.gray200, borderRadius: borderRadius.full, marginTop: spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: borderRadius.full },
  macrosGrid: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md },
  macroCard: { flex: 1, backgroundColor: Colors.white, padding: spacing.md, borderRadius: borderRadius.md, borderLeftWidth: 4 },
  macroLabel: { fontSize: fontSize.sm, color: Colors.textSecondary, marginBottom: spacing.xs },
  macroValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: Colors.text },
  macroGoal: { fontSize: fontSize.xs, color: Colors.textSecondary },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionButton: { width: '47%', backgroundColor: Colors.white, padding: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center' },
  actionIcon: { fontSize: 32, marginBottom: spacing.sm },
  actionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: Colors.text },
});

export default HomeScreen;
