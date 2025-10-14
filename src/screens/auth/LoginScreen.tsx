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
import { EmailValidator, PasswordValidator } from '@/utils/validators';
import { AnalyticsService } from '@/services/analytics/analyticsService';

// Components
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';

export const LoginScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate email
    const emailValidation = EmailValidator.validate(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error || '';
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    try {
      clearError();
      
      if (!validateForm()) {
        return;
      }

      await login(formData.email, formData.password);
      
      // Track successful login
      AnalyticsService.trackLogin('email');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show error alert
      Alert.alert(
        'Đăng nhập thất bại',
        error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
      
      // Track failed login
      AnalyticsService.trackError('login_failed', error.message || 'Unknown error');
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
    AnalyticsService.trackEvent('navigate_to_register', { from: 'login_screen' });
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
    AnalyticsService.trackEvent('navigate_to_forgot_password', { from: 'login_screen' });
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
          {/* Header with gradient */}
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="nutrition" size={48} color={Colors.white} />
              </View>
              <Text style={styles.appName}>NutriScanVN</Text>
              <Text style={styles.tagline}>
                Quét thực phẩm thông minh với AI
              </Text>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Chào mừng trở lại!
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Đăng nhập để tiếp tục hành trình sức khỏe
              </Text>

              <View style={styles.inputContainer}>
                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  error={formErrors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  leftIcon={
                    <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                  }
                  placeholder="Nhập địa chỉ email của bạn"
                  required
                />

                <Input
                  ref={passwordRef}
                  label="Mật khẩu"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  error={formErrors.password}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={navigateToForgotPassword}
              >
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              <Button
                title="Đăng nhập"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                style={styles.loginButton}
              />

              {/* Social Login Options */}
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: theme.colors.lightGray }]} />
                <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                  Hoặc đăng nhập với
                </Text>
                <View style={[styles.divider, { backgroundColor: theme.colors.lightGray }]} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
                  Chưa có tài khoản?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                    Đăng ký ngay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading overlay */}
      <Loading visible={isLoading} overlay message="Đang đăng nhập..." />
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
    paddingBottom: 40,
    paddingHorizontal: lightTheme.spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: lightTheme.spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.xl,
  },
  form: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.xl,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: lightTheme.spacing.lg,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: lightTheme.spacing.xl,
    padding: lightTheme.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: lightTheme.spacing.xl,
  },

  // Social login
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: lightTheme.spacing.md,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: lightTheme.spacing.xl,
    gap: lightTheme.spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.md,
    ...lightTheme.shadows.sm,
  },
  socialButtonText: {
    marginLeft: lightTheme.spacing.sm,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },

  // Register link
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: lightTheme.spacing.lg,
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;