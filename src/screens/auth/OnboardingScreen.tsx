import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { useAuth } from '@/hooks/useAuth';
import { useUserMetrics } from '@/hooks/useUserMetrics';
import { useTheme } from '@/hooks/useTheme';
import { Config } from '@/constants/config';
import { 
  UserMetricsValidator,
  FormValidator 
} from '@/utils/validators';
import { 
  BMICalculator,
  CalorieGoalCalculator,
  WaterIntakeCalculator 
} from '@/utils/calculations';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { StorageService } from '@/services/storage/storageService';

// Components
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Thông tin cá nhân',
    subtitle: 'Cho chúng tôi biết về bạn',
    icon: 'person-outline',
  },
  {
    id: 2,
    title: 'Chỉ số cơ thể',
    subtitle: 'Chiều cao và cân nặng hiện tại',
    icon: 'fitness-outline',
  },
  {
    id: 3,
    title: 'Mục tiêu sức khỏe',
    subtitle: 'Bạn muốn đạt được điều gì?',
    icon: 'target-outline',
  },
  {
    id: 4,
    title: 'Sở thích ăn uống',
    subtitle: 'Hoàn thiện hồ sơ dinh dưỡng',
    icon: 'restaurant-outline',
  },
];

export const OnboardingScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { updateMetrics } = useUserMetrics();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Step 1: Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | '',
  });

  // Step 2: Body Metrics
  const [bodyMetrics, setBodyMetrics] = useState({
    height: '',
    weight: '',
  });

  // Step 3: Goals
  const [goals, setGoals] = useState({
    goal: '' as keyof typeof Config.GOALS | '',
    activityLevel: '' as keyof typeof Config.ACTIVITY_LEVELS | '',
    targetWeight: '',
  });

  // Step 4: Preferences
  const [preferences, setPreferences] = useState({
    dietaryPreferences: [] as string[],
    allergies: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!personalInfo.dateOfBirth) {
          stepErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
        }
        if (!personalInfo.gender) {
          stepErrors.gender = 'Giới tính là bắt buộc';
        }
        break;

      case 2:
        const heightValidation = UserMetricsValidator.validateHeight(parseFloat(bodyMetrics.height));
        if (!heightValidation.isValid) {
          stepErrors.height = heightValidation.error || '';
        }

        const weightValidation = UserMetricsValidator.validateWeight(parseFloat(bodyMetrics.weight));
        if (!weightValidation.isValid) {
          stepErrors.weight = weightValidation.error || '';
        }
        break;

      case 3:
        if (!goals.goal) {
          stepErrors.goal = 'Mục tiêu là bắt buộc';
        }
        if (!goals.activityLevel) {
          stepErrors.activityLevel = 'Mức độ hoạt động là bắt buộc';
        }
        break;

      case 4:
        // Preferences are optional
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ x: currentStep * screenWidth, animated: true });
      } else {
        completeOnboarding();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ x: (currentStep - 2) * screenWidth, animated: true });
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);

      // Prepare profile data
      const profileData = {
        dateOfBirth: personalInfo.dateOfBirth,
        gender: personalInfo.gender,
        height: parseFloat(bodyMetrics.height),
        weight: parseFloat(bodyMetrics.weight),
        activityLevel: goals.activityLevel,
        goal: goals.goal,
        targetWeight: goals.targetWeight ? parseFloat(goals.targetWeight) : undefined,
        dietaryPreferences: preferences.dietaryPreferences,
        allergies: preferences.allergies,
      };

      // Update profile
      await updateProfile(profileData);

      // Mark onboarding as completed
      await StorageService.setOnboardingCompleted(true);

      // Track analytics
      AnalyticsService.trackEvent('onboarding_completed', {
        gender: personalInfo.gender,
        age: new Date().getFullYear() - new Date(personalInfo.dateOfBirth).getFullYear(),
        goal: goals.goal,
        activity_level: goals.activityLevel,
        has_dietary_preferences: preferences.dietaryPreferences.length > 0,
        has_allergies: preferences.allergies.length > 0,
      });

      // Navigate to main app
      navigation.replace('MainStack');

    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      Alert.alert(
        'Lỗi hoàn thiện hồ sơ',
        error.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(currentStep / 4) * 100}%` }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
        Bước {currentStep} / 4
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Ionicons name="person-outline" size={32} color={Colors.primary} />
        </View>
        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
          Thông tin cá nhân
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
          Giúp chúng tôi hiểu về bạn để đưa ra lời khuyên phù hợp
        </Text>
      </View>

      <View style={styles.stepContent}>
        <Input
          label="Ngày sinh"
          value={personalInfo.dateOfBirth}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: value }))}
          error={errors.dateOfBirth}
          placeholder="DD/MM/YYYY"
          keyboardType="numeric"
          leftIcon={<Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />}
          required
        />

        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
          Giới tính *
        </Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              personalInfo.gender === 'male' && styles.genderButtonActive,
            ]}
            onPress={() => setPersonalInfo(prev => ({ ...prev, gender: 'male' }))}
          >
            <Ionicons 
              name="man-outline" 
              size={24} 
              color={personalInfo.gender === 'male' ? Colors.white : Colors.textSecondary} 
            />
            <Text style={[
              styles.genderButtonText,
              { color: personalInfo.gender === 'male' ? Colors.white : Colors.textSecondary }
            ]}>
              Nam
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              personalInfo.gender === 'female' && styles.genderButtonActive,
            ]}
            onPress={() => setPersonalInfo(prev => ({ ...prev, gender: 'female' }))}
          >
            <Ionicons 
              name="woman-outline" 
              size={24} 
              color={personalInfo.gender === 'female' ? Colors.white : Colors.textSecondary} 
            />
            <Text style={[
              styles.genderButtonText,
              { color: personalInfo.gender === 'female' ? Colors.white : Colors.textSecondary }
            ]}>
              Nữ
            </Text>
          </TouchableOpacity>
        </View>
        {errors.gender && (
          <Text style={styles.errorText}>{errors.gender}</Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Ionicons name="fitness-outline" size={32} color={Colors.primary} />
        </View>
        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
          Chỉ số cơ thể
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
          Thông tin này giúp tính toán BMI và nhu cầu calo chính xác
        </Text>
      </View>

      <View style={styles.stepContent}>
        <View style={styles.metricsRow}>
          <Input
            label="Chiều cao (cm)"
            value={bodyMetrics.height}
            onChangeText={(value) => setBodyMetrics(prev => ({ ...prev, height: value }))}
            error={errors.height}
            placeholder="170"
            keyboardType="numeric"
            leftIcon={<Ionicons name="resize-outline" size={20} color={Colors.textSecondary} />}
            containerStyle={styles.metricsInput}
            required
          />

          <Input
            label="Cân nặng (kg)"
            value={bodyMetrics.weight}
            onChangeText={(value) => setBodyMetrics(prev => ({ ...prev, weight: value }))}
            error={errors.weight}
            placeholder="65"
            keyboardType="numeric"
            leftIcon={<Ionicons name="barbell-outline" size={20} color={Colors.textSecondary} />}
            containerStyle={styles.metricsInput}
            required
          />
        </View>

        {/* BMI Preview */}
        {bodyMetrics.height && bodyMetrics.weight && (
          <Card style={styles.bmiPreview}>
            <View style={styles.bmiContainer}>
              <Text style={styles.bmiLabel}>BMI của bạn:</Text>
              <Text style={[
                styles.bmiValue,
                { color: BMICalculator.getCategoryColor(
                  BMICalculator.calculate(parseFloat(bodyMetrics.weight), parseFloat(bodyMetrics.height))
                )}
              ]}>
                {BMICalculator.calculate(
                  parseFloat(bodyMetrics.weight), 
                  parseFloat(bodyMetrics.height)
                ).toFixed(1)}
              </Text>
              <Text style={styles.bmiCategory}>
                {BMICalculator.getCategory(
                  BMICalculator.calculate(parseFloat(bodyMetrics.weight), parseFloat(bodyMetrics.height))
                ) === 'NORMAL' ? 'Bình thường' : 
                  BMICalculator.getCategory(
                    BMICalculator.calculate(parseFloat(bodyMetrics.weight), parseFloat(bodyMetrics.height))
                  ) === 'UNDERWEIGHT' ? 'Thiếu cân' :
                  BMICalculator.getCategory(
                    BMICalculator.calculate(parseFloat(bodyMetrics.weight), parseFloat(bodyMetrics.height))
                  ) === 'OVERWEIGHT' ? 'Thừa cân' : 'Béo phì'}
              </Text>
            </View>
          </Card>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Ionicons name="target-outline" size={32} color={Colors.primary} />
        </View>
        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
          Mục tiêu sức khỏe
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
          Chọn mục tiêu và mức độ hoạt động để tính toán nhu cầu calo
        </Text>
      </View>

      <View style={styles.stepContent}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Mục tiêu của bạn:
        </Text>
        <View style={styles.goalOptions}>
          {Object.entries(Config.GOALS).map(([key, goalInfo]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.optionButton,
                goals.goal === key && styles.optionButtonActive,
              ]}
              onPress={() => setGoals(prev => ({ ...prev, goal: key as any }))}
            >
              <Text style={[
                styles.optionButtonText,
                { color: goals.goal === key ? Colors.white : theme.colors.text }
              ]}>
                {goalInfo.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.goal && <Text style={styles.errorText}>{errors.goal}</Text>}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Mức độ hoạt động:
        </Text>
        <View style={styles.activityOptions}>
          {Object.entries(Config.ACTIVITY_LEVELS).map(([key, activityInfo]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.activityButton,
                goals.activityLevel === key && styles.activityButtonActive,
              ]}
              onPress={() => setGoals(prev => ({ ...prev, activityLevel: key as any }))}
            >
              <Text style={[
                styles.activityButtonTitle,
                { color: goals.activityLevel === key ? Colors.white : theme.colors.text }
              ]}>
                {activityInfo.label.split('(')[0].trim()}
              </Text>
              <Text style={[
                styles.activityButtonSubtitle,
                { color: goals.activityLevel === key ? Colors.white : theme.colors.textSecondary }
              ]}>
                {activityInfo.label.split('(')[1]?.replace(')', '') || ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.activityLevel && <Text style={styles.errorText}>{errors.activityLevel}</Text>}

        {goals.goal === 'LOSE_WEIGHT' && (
          <Input
            label="Cân nặng mục tiêu (kg)"
            value={goals.targetWeight}
            onChangeText={(value) => setGoals(prev => ({ ...prev, targetWeight: value }))}
            placeholder="60"
            keyboardType="numeric"
            hint="Để trống nếu chưa xác định"
          />
        )}
      </View>
    </View>
  );

  const renderStep4 = () => {
    const dietaryOptions = [
      'Ăn chay', 'Ăn chay trứng sữa', 'Keto', 'Paleo', 
      'Địa Trung Hải', 'Ít carb', 'Ít béo', 'Không gluten'
    ];

    const allergyOptions = [
      'Sữa', 'Trứng', 'Đậu phộng', 'Hạt cây', 'Cá', 
      'Tôm cua', 'Lúa mì', 'Đậu nành', 'Sesame'
    ];

    const toggleDietaryPreference = (preference: string) => {
      setPreferences(prev => ({
        ...prev,
        dietaryPreferences: prev.dietaryPreferences.includes(preference)
          ? prev.dietaryPreferences.filter(p => p !== preference)
          : [...prev.dietaryPreferences, preference]
      }));
    };

    const toggleAllergy = (allergy: string) => {
      setPreferences(prev => ({
        ...prev,
        allergies: prev.allergies.includes(allergy)
          ? prev.allergies.filter(a => a !== allergy)
          : [...prev.allergies, allergy]
      }));
    };

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepIcon}>
            <Ionicons name="restaurant-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            Sở thích ăn uống
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
            Thông tin này giúp chúng tôi đề xuất thực phẩm phù hợp
          </Text>
        </View>

        <View style={styles.stepContent}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Chế độ ăn ưa thích (tùy chọn):
          </Text>
          <View style={styles.preferenceOptions}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.preferenceButton,
                  preferences.dietaryPreferences.includes(option) && styles.preferenceButtonActive,
                ]}
                onPress={() => toggleDietaryPreference(option)}
              >
                <Text style={[
                  styles.preferenceButtonText,
                  { color: preferences.dietaryPreferences.includes(option) ? Colors.white : theme.colors.text }
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Dị ứng thực phẩm (tùy chọn):
          </Text>
          <View style={styles.preferenceOptions}>
            {allergyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.allergyButton,
                  preferences.allergies.includes(option) && styles.allergyButtonActive,
                ]}
                onPress={() => toggleAllergy(option)}
              >
                <Text style={[
                  styles.preferenceButtonText,
                  { color: preferences.allergies.includes(option) ? Colors.white : theme.colors.text }
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace('MainStack')}
        >
          <Text style={styles.skipButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Thiết lập hồ sơ</Text>
        {renderProgressBar()}
      </LinearGradient>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <Button
            title="Quay lại"
            onPress={prevStep}
            variant="outline"
            style={styles.navButton}
          />
        )}
        
        <Button
          title={currentStep === 4 ? 'Hoàn thành' : 'Tiếp theo'}
          onPress={nextStep}
          loading={isLoading}
          disabled={isLoading}
          style={[styles.navButton, currentStep === 1 && styles.fullWidthButton]}
        />
      </View>

      <Loading visible={isLoading} overlay message="Đang hoàn thiện hồ sơ..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: lightTheme.spacing.lg,
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: lightTheme.spacing.lg,
    padding: 8,
  },
  skipButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.lg,
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: lightTheme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  progressText: {
    color: Colors.white,
    fontSize: 14,
  },

  // Steps
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: screenWidth,
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  stepHeader: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xl,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  stepContent: {
    flex: 1,
  },

  // Form elements
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: lightTheme.spacing.md,
    marginTop: lightTheme.spacing.lg,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: lightTheme.spacing.xs,
  },

  // Gender selection
  genderContainer: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.lg,
    gap: lightTheme.spacing.sm,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
  },
  metricsInput: {
    flex: 1,
  },
  bmiPreview: {
    marginTop: lightTheme.spacing.lg,
    backgroundColor: Colors.primary + '10',
  },
  bmiContainer: {
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: lightTheme.spacing.xs,
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  // Goals and activities
  goalOptions: {
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.lg,
  },
  activityOptions: {
    gap: lightTheme.spacing.sm,
  },
  optionButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.lg,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  activityButtonActive: {
    backgroundColor: Colors.primary,
  },
  activityButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityButtonSubtitle: {
    fontSize: 12,
  },

  // Preferences
  preferenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.lg,
  },
  preferenceButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.full,
    paddingVertical: lightTheme.spacing.sm,
    paddingHorizontal: lightTheme.spacing.md,
  },
  preferenceButtonActive: {
    backgroundColor: Colors.primary,
  },
  allergyButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.full,
    paddingVertical: lightTheme.spacing.sm,
    paddingHorizontal: lightTheme.spacing.md,
  },
  allergyButtonActive: {
    backgroundColor: Colors.warning,
  },
  preferenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.lg,
    gap: lightTheme.spacing.md,
  },
  navButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default OnboardingScreen;