import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { EXERCISE_TYPES } from '@constants/config';
import Toast from 'react-native-toast-message';

interface Exercise {
  id: string;
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  time: string;
}

const ExerciseTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState(EXERCISE_TYPES[0].value);
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      type: 'running',
      duration: 30,
      intensity: 'high',
      caloriesBurned: 300,
      time: '08:00',
    },
    {
      id: '2',
      type: 'yoga',
      duration: 45,
      intensity: 'low',
      caloriesBurned: 120,
      time: '18:30',
    },
  ]);

  const totalCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);

  const handleAddExercise = () => {
    const durationNum = parseInt(duration);
    if (!durationNum || durationNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập thời gian hợp lệ',
      });
      return;
    }

    // Simple calorie calculation
    const intensityMultiplier = { low: 3, medium: 5, high: 8 };
    const caloriesBurned = Math.round(durationNum * intensityMultiplier[intensity]);

    const newExercise: Exercise = {
      id: Date.now().toString(),
      type: selectedType,
      duration: durationNum,
      intensity,
      caloriesBurned,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setExercises([newExercise, ...exercises]);
    setShowAddModal(false);
    setDuration('30');

    Toast.show({
      type: 'success',
      text1: 'Đã thêm bài tập',
      text2: `${caloriesBurned} calories đã đốt cháy`,
    });
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
    Toast.show({
      type: 'info',
      text1: 'Đã xóa bài tập',
    });
  };

  const getExerciseInfo = (type: string) => {
    return EXERCISE_TYPES.find((ex) => ex.value === type) || EXERCISE_TYPES[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tập luyện</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Card style={styles.statCard}>
            <Ionicons name="flame" size={32} color={Colors.secondary} />
            <Text style={styles.statValue}>{totalCalories}</Text>
            <Text style={styles.statLabel}>Calories đốt cháy</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="time" size={32} color={Colors.primary} />
            <Text style={styles.statValue}>{totalDuration}</Text>
            <Text style={styles.statLabel}>Phút tập luyện</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="barbell" size={32} color={Colors.accent} />
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Bài tập hôm nay</Text>
          </Card>
        </View>

        {/* Quick Add Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bài tập phổ biến</Text>
          <View style={styles.quickAddGrid}>
            {EXERCISE_TYPES.slice(0, 6).map((exercise) => (
              <TouchableOpacity
                key={exercise.value}
                style={styles.quickAddButton}
                onPress={() => {
                  setSelectedType(exercise.value);
                  setShowAddModal(true);
                }}
              >
                <Text style={styles.quickAddIcon}>{exercise.icon}</Text>
                <Text style={styles.quickAddText}>{exercise.labelVi}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercise History */}
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Lịch sử hôm nay</Text>
          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💪</Text>
              <Text style={styles.emptyText}>Chưa có bài tập nào</Text>
              <Button
                title="Thêm bài tập đầu tiên"
                onPress={() => setShowAddModal(true)}
                size="small"
              />
            </View>
          ) : (
            <FlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ExerciseCard exercise={item} onDelete={handleDeleteExercise} />
              )}
              scrollEnabled={false}
            />
          )}
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Mẹo tập luyện</Text>
          <Text style={styles.tipsText}>
            • Khởi động 5-10 phút trước khi tập{'\n'}
            • Giữ cơ thể hydrat hóa{'\n'}
            • Nghỉ ngơi 1-2 ngày mỗi tuần{'\n'}
            • Tăng cường độ dần dần
          </Text>
        </Card>
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm bài tập"
      >
        <View style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Loại bài tập</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {EXERCISE_TYPES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.value}
                  style={[
                    styles.exerciseTypeButton,
                    selectedType === exercise.value && styles.exerciseTypeButtonActive,
                  ]}
                  onPress={() => setSelectedType(exercise.value)}
                >
                  <Text style={styles.exerciseTypeIcon}>{exercise.icon}</Text>
                  <Text
                    style={[
                      styles.exerciseTypeText,
                      selectedType === exercise.value && styles.exerciseTypeTextActive,
                    ]}
                  >
                    {exercise.labelVi}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Input
            label="Thời gian (phút)"
            placeholder="30"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cường độ</Text>
            <View style={styles.intensityButtons}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.intensityButton,
                    intensity === level && styles.intensityButtonActive,
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text
                    style={[
                      styles.intensityText,
                      intensity === level && styles.intensityTextActive,
                    ]}
                  >
                    {level === 'low' ? 'Nhẹ' : level === 'medium' ? 'Vừa' : 'Cao'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button title="Thêm bài tập" onPress={handleAddExercise} fullWidth />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const ExerciseCard: React.FC<{
  exercise: Exercise;
  onDelete: (id: string) => void;
}> = ({ exercise, onDelete }) => {
  const exerciseInfo = EXERCISE_TYPES.find((ex) => ex.value === exercise.type) || EXERCISE_TYPES[0];
  const intensityColors = {
    low: Colors.success,
    medium: Colors.secondary,
    high: Colors.error,
  };

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseIcon}>
        <Text style={styles.exerciseIconText}>{exerciseInfo.icon}</Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exerciseInfo.labelVi}</Text>
        <View style={styles.exerciseDetails}>
          <Text style={styles.exerciseDetailText}>{exercise.duration} phút</Text>
          <Text style={[styles.intensityBadge, { color: intensityColors[exercise.intensity] }]}>
            •{' '}
            {exercise.intensity === 'low'
              ? 'Nhẹ'
              : exercise.intensity === 'medium'
              ? 'Vừa'
              : 'Cao'}
          </Text>
          <Text style={styles.exerciseDetailText}>• {exercise.caloriesBurned} kcal</Text>
        </View>
        <Text style={styles.exerciseTime}>{exercise.time}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(exercise.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );
};

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
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAddButton: {
    width: '31%',
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  quickAddIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  quickAddText: {
    fontSize: fontSize.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  historyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    marginBottom: spacing.lg,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  exerciseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseIconText: {
    fontSize: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  exerciseDetailText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginRight: spacing.xs,
  },
  intensityBadge: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginRight: spacing.xs,
  },
  exerciseTime: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  modalContent: {
    gap: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  exerciseTypeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  exerciseTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  exerciseTypeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  exerciseTypeText: {
    fontSize: fontSize.xs,
    color: Colors.text,
  },
  exerciseTypeTextActive: {
    color: Colors.white,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  intensityButtonActive: {
    backgroundColor: Colors.primary,
  },
  intensityText: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  intensityTextActive: {
    color: Colors.white,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: Colors.secondary + '10',
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

export default ExerciseTrackerScreen;
