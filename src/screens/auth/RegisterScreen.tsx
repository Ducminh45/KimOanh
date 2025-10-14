import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { 
  EmailValidator, 
  PasswordValidator, 
  FormValidator 
} from '@/utils/validators';
import { AnalyticsService } from '@/services/analytics/analyticsService';

// Components
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';

export const RegisterScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Refs for form navigation
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate first name
    const firstNameValidation = FormValidator.validateName(formData.firstName);
    if (!firstNameValidation.isValid) {
      errors.firstName = firstNameValidation.error || '';
    }

    // Validate last name
    const lastNameValidation = FormValidator.validateName(formData.lastName);
    if (!lastNameValidation.isValid) {
      errors.lastName = lastNameValidation.error || '';
    }

    // Validate email
    const emailValidation = EmailValidator.validate(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error || '';
    }

    // Validate phone (optional)
    if (formData.phone) {
      const phoneValidation = FormValidator.validatePhoneNumber(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error || '';
      }
    }

    // Validate password
    const passwordValidation = PasswordValidator.validate(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error || '';
    }

    // Validate confirm password
    const confirmPasswordValidation = PasswordValidator.validateConfirmation(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      errors.confirmPassword = confirmPasswordValidation.error || '';
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      errors.terms = 'Bạn cần đồng ý với điều khoản sử dụng';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    try {
      clearError();
      
      if (!validateForm()) {
        return;
      }

      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      });
      
      // Track successful registration
      AnalyticsService.trackSignUp('email');
      
      // Navigate to onboarding
      navigation.navigate('Onboarding');
      
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Show error alert
      Alert.alert(
        'Đăng ký thất bại',
        error.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
      
      // Track failed registration
      AnalyticsService.trackError('register_failed', error.message || 'Unknown error');
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
    AnalyticsService.trackEvent('navigate_to_login', { from: 'register_screen' });
  };

  const navigateToTerms = () => {
    navigation.navigate('TermsOfService');
  };

  const navigateToPrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Tạo tài khoản mới</Text>
              <Text style={styles.headerSubtitle}>
                Bắt đầu hành trình sức khỏe của bạn
              </Text>
            </View>
          </LinearGradient>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <Input
                  label="Tên"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  error={formErrors.firstName}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  containerStyle={styles.nameInput}
                  placeholder="Tên của bạn"
                  required
                />

                <Input
                  ref={lastNameRef}
                  label="Họ"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  error={formErrors.lastName}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  containerStyle={styles.nameInput}
                  placeholder="Họ của bạn"
                  required
                />
              </View>

              <Input
                ref={emailRef}
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={formErrors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                leftIcon={
                  <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                }
                placeholder="Nhập địa chỉ email"
                required
              />

              <Input
                ref={phoneRef}
                label="Số điện thoại"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                error={formErrors.phone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                leftIcon={
                  <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
                }
                placeholder="Số điện thoại (tùy chọn)"
                hint="Số điện thoại giúp chúng tôi hỗ trợ bạn tốt hơn"
              />

              <Input
                ref={passwordRef}
                label="Mật khẩu"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={formErrors.password}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                }
                rightIcon={
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
                placeholder="Tạo mật khẩu mạnh"
                hint="Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                required
              />

              <Input
                ref={confirmPasswordRef}
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                error={formErrors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                }
                rightIcon={
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                }
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="Nhập lại mật khẩu"
                required
              />

              {/* Terms and Privacy */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <Ionicons
                    name={acceptTerms ? "checkbox" : "square-outline"}
                    size={24}
                    color={acceptTerms ? Colors.primary : Colors.textSecondary}
                  />
                </TouchableOpacity>
                
                <View style={styles.termsText}>
                  <Text style={[styles.termsTextContent, { color: theme.colors.textSecondary }]}>
                    Tôi đồng ý với{' '}
                    <TouchableOpacity onPress={navigateToTerms}>
                      <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                        Điều khoản sử dụng
                      </Text>
                    </TouchableOpacity>
                    {' '}và{' '}
                    <TouchableOpacity onPress={navigateToPrivacy}>
                      <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                        Chính sách bảo mật
                      </Text>
                    </TouchableOpacity>
                  </Text>
                </View>
              </View>

              {formErrors.terms && (
                <Text style={styles.termsError}>{formErrors.terms}</Text>
              )}

              <Button
                title="Tạo tài khoản"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading || !acceptTerms}
                fullWidth
                style={styles.registerButton}
              />

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                  Đã có tài khoản?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                    Đăng nhập ngay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading overlay */}
      <Loading visible={isLoading} overlay message="Đang tạo tài khoản..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: lightTheme.spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: lightTheme.spacing.lg,
    zIndex: 1,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: lightTheme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.lg,
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
  },
  nameInput: {
    flex: 1,
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: lightTheme.spacing.md,
  },
  checkbox: {
    marginRight: lightTheme.spacing.sm,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
  },
  termsTextContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsError: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: lightTheme.spacing.md,
    marginLeft: 32, // Align with checkbox
  },

  // Buttons
  registerButton: {
    marginBottom: lightTheme.spacing.xl,
  },

  // Login link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: lightTheme.spacing.lg,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;