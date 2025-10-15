import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import Card from '@components/common/Card';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { GOALS, ACTIVITY_LEVELS, DIETARY_PREFERENCES, COMMON_ALLERGIES } from '@constants/config';
import { calculateBMI, calculateBMR, calculateTDEE, calculateAge, calculateMacros } from '@utils/calculations';
import Toast from 'react-native-toast-message';
import userApi from '@services/api/userApi';

const OnboardingDetailScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Personal Info
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  // Step 2: Body Metrics
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Step 3: Goals
  const [selectedGoal, setSelectedGoal] = useState<keyof typeof GOALS>('maintain_weight');
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<keyof typeof ACTIVITY_LEVELS>('moderately_active');

  // Step 4: Preferences
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!dateOfBirth || !gender) {
        Toast.show({
          type: 'error',
          text1: 'Vui lòng điền đầy đủ thông tin',
        });
        return;
      }
    }

    if (currentStep === 2) {
      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);

      if (!heightNum || heightNum < 50 || heightNum > 300) {
        Toast.show({
          type: 'error',
          text1: 'Chiều cao không hợp lệ',
          text2: 'Vui lòng nhập 50-300 cm',
        });
        return;
      }

      if (!weightNum || weightNum < 20 || weightNum > 500) {
        Toast.show({
          type: 'error',
          text1: 'Cân nặng không hợp lệ',
          text2: 'Vui lòng nhập 20-500 kg',
        });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const onboardingData = {
        dateOfBirth,
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        goal: selectedGoal,
        activityLevel: selectedActivityLevel,
        dietaryPreferences: selectedPreferences,
        allergies: selectedAllergies.map((allergen) => ({ name: allergen })),
      };

      const response = await userApi.completeOnboarding(onboardingData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Hoàn thành!',
          text2: 'Chào mừng đến với NutriScanVN 🎉',
        });
        navigation.replace('Main');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể hoàn thành onboarding',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const renderBMIPreview = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum && weightNum) {
      const bmi = calculateBMI(weightNum, heightNum);
      const age = dateOfBirth ? calculateAge(dateOfBirth) : 25;
      const bmr = calculateBMR(weightNum, heightNum, age, gender);
      const tdee = calculateTDEE(bmr, selectedActivityLevel);

      return (
        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>📊 Chỉ số của bạn</Text>
          <View style={styles.previewGrid}>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>BMI</Text>
              <Text style={styles.previewValue}>{bmi}</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>BMR</Text>
              <Text style={styles.previewValue}>{bmr}</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>TDEE</Text>
              <Text style={styles.previewValue}>{tdee}</Text>
            </View>
          </View>
        </Card>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Bước {currentStep} / {totalSteps}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>👤</Text>
            <Text style={styles.stepTitle}>Thông tin cá nhân</Text>
            <Text style={styles.stepSubtitle}>
              Giúp chúng tôi hiểu bạn hơn
            </Text>

            <View style={styles.form}>
              <Input
                label="Ngày sinh"
                placeholder="DD/MM/YYYY"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                leftIcon="calendar-outline"
                required
              />

              <Text style={styles.label}>Giới tính *</Text>
              <View style={styles.genderButtons}>
                <GenderButton
                  icon="male"
                  label="Nam"
                  selected={gender === 'male'}
                  onPress={() => setGender('male')}
                />
                <GenderButton
                  icon="female"
                  label="Nữ"
                  selected={gender === 'female'}
                  onPress={() => setGender('female')}
                />
                <GenderButton
                  icon="transgender"
                  label="Khác"
                  selected={gender === 'other'}
                  onPress={() => setGender('other')}
                />
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Body Metrics */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>⚖️</Text>
            <Text style={styles.stepTitle}>Chỉ số cơ thể</Text>
            <Text style={styles.stepSubtitle}>
              Để tính toán chính xác mục tiêu của bạn
            </Text>

            <View style={styles.form}>
              <Input
                label="Chiều cao (cm)"
                placeholder="170"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                leftIcon="resize-outline"
                required
              />

              <Input
                label="Cân nặng (kg)"
                placeholder="65"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                leftIcon="fitness-outline"
                required
              />

              {renderBMIPreview()}
            </View>
          </View>
        )}

        {/* Step 3: Goals */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>🎯</Text>
            <Text style={styles.stepTitle}>Mục tiêu của bạn</Text>
            <Text style={styles.stepSubtitle}>
              Chọn mục tiêu phù hợp với bạn
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Mục tiêu *</Text>
              <View style={styles.optionsGrid}>
                {Object.entries(GOALS).map(([key, goal]) => (
                  <GoalCard
                    key={key}
                    icon={goal.icon}
                    label={goal.labelVi}
                    selected={selectedGoal === key}
                    onPress={() => setSelectedGoal(key as keyof typeof GOALS)}
                  />
                ))}
              </View>

              <Text style={[styles.label, { marginTop: spacing.lg }]}>
                Mức độ vận động *
              </Text>
              <View style={styles.optionsList}>
                {Object.entries(ACTIVITY_LEVELS).map(([key, level]) => (
                  <ActivityLevelButton
                    key={key}
                    label={level.labelVi}
                    description={level.description}
                    selected={selectedActivityLevel === key}
                    onPress={() => setSelectedActivityLevel(key as keyof typeof ACTIVITY_LEVELS)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>🍽️</Text>
            <Text style={styles.stepTitle}>Sở thích ăn uống</Text>
            <Text style={styles.stepSubtitle}>
              Giúp chúng tôi gợi ý món ăn phù hợp
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Chế độ ăn (tùy chọn)</Text>
              <View style={styles.chipsContainer}>
                {DIETARY_PREFERENCES.map((pref) => (
                  <Chip
                    key={pref.value}
                    label={pref.labelVi}
                    selected={selectedPreferences.includes(pref.value)}
                    onPress={() => togglePreference(pref.value)}
                  />
                ))}
              </View>

              <Text style={[styles.label, { marginTop: spacing.lg }]}>
                Dị ứng (tùy chọn)
              </Text>
              <View style={styles.chipsContainer}>
                {COMMON_ALLERGIES.map((allergy) => (
                  <Chip
                    key={allergy.value}
                    label={allergy.labelVi}
                    selected={selectedAllergies.includes(allergy.value)}
                    onPress={() => toggleAllergy(allergy.value)}
                    color={Colors.error}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <Button
          title={currentStep === 1 ? 'Bỏ qua' : 'Quay lại'}
          variant="outline"
          onPress={handleBack}
          style={styles.navButton}
        />
        <Button
          title={currentStep === totalSteps ? 'Hoàn thành' : 'Tiếp theo'}
          onPress={handleNext}
          loading={isSubmitting}
          style={styles.navButtonPrimary}
        />
      </View>
    </SafeAreaView>
  );
};

const GenderButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ icon, label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.genderButton, selected && styles.genderButtonSelected]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={32}
      color={selected ? Colors.primary : Colors.gray500}
    />
    <Text style={[styles.genderLabel, selected && styles.genderLabelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const GoalCard: React.FC<{
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ icon, label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.goalCard, selected && styles.goalCardSelected]}
    onPress={onPress}
  >
    <Text style={styles.goalIcon}>{icon}</Text>
    <Text style={[styles.goalLabel, selected && styles.goalLabelSelected]}>
      {label}
    </Text>
    {selected && (
      <View style={styles.selectedIndicator}>
        <Ionicons name="checkmark" size={16} color={Colors.white} />
      </View>
    )}
  </TouchableOpacity>
);

const ActivityLevelButton: React.FC<{
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, description, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.activityButton, selected && styles.activityButtonSelected]}
    onPress={onPress}
  >
    <View style={styles.activityButtonContent}>
      <Text style={[styles.activityLabel, selected && styles.activityLabelSelected]}>
        {label}
      </Text>
      <Text style={styles.activityDescription}>{description}</Text>
    </View>
    {selected && (
      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
    )}
  </TouchableOpacity>
);

const Chip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}> = ({ label, selected, onPress, color = Colors.primary }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      selected && { backgroundColor: color + '20', borderColor: color },
    ]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, selected && { color }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.gray200,
  },
  genderButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  genderLabel: {
    fontSize: fontSize.md,
    color: Colors.text,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  genderLabelSelected: {
    color: Colors.primary,
    fontWeight: fontWeight.bold,
  },
  previewCard: {
    marginTop: spacing.md,
    backgroundColor: Colors.primary + '10',
  },
  previewTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewItem: {
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  previewValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
    marginTop: spacing.xs,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  goalCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray200,
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  goalIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  goalLabel: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: Colors.primary,
    fontWeight: fontWeight.bold,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: spacing.sm,
  },
  activityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.gray200,
  },
  activityButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  activityButtonContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  activityLabelSelected: {
    color: Colors.primary,
  },
  activityDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  navButton: {
    flex: 1,
  },
  navButtonPrimary: {
    flex: 2,
  },
});

export default OnboardingDetailScreen;
