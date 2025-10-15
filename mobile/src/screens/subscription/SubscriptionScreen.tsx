import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { formatCurrency } from '@utils/formatters';
import { useAuthStore } from '@store/authStore';
import Toast from 'react-native-toast-message';

const SubscriptionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const plans = {
    monthly: {
      id: 'monthly',
      name: 'Premium Tháng',
      price: 99000,
      duration: 'tháng',
      savings: 0,
    },
    yearly: {
      id: 'yearly',
      name: 'Premium Năm',
      price: 990000,
      duration: 'năm',
      savings: 198000, // 99k x 12 - 990k
      popular: true,
    },
  };

  const features = [
    { icon: '📸', text: 'Quét thực phẩm không giới hạn' },
    { icon: '🤖', text: 'AI chatbot cao cấp' },
    { icon: '📊', text: 'Thống kê và báo cáo chi tiết' },
    { icon: '🍱', text: 'Gợi ý thực đơn cá nhân hóa' },
    { icon: '👥', text: 'Tính năng cộng đồng mở rộng' },
    { icon: '🎯', text: 'Tư vấn dinh dưỡng chuyên sâu' },
    { icon: '📱', text: 'Hỗ trợ ưu tiên 24/7' },
    { icon: '🚫', text: 'Không quảng cáo' },
  ];

  const freeFeatures = [
    { icon: '📸', text: '3 lượt quét mỗi ngày' },
    { icon: '📊', text: 'Theo dõi dinh dưỡng cơ bản' },
    { icon: '💧', text: 'Theo dõi nước uống' },
    { icon: '💪', text: 'Theo dõi tập luyện' },
    { icon: '🤖', text: 'AI chatbot cơ bản' },
  ];

  const handleSubscribe = () => {
    const plan = plans[selectedPlan];
    Toast.show({
      type: 'info',
      text1: 'Tính năng đang phát triển',
      text2: `Thanh toán ${formatCurrency(plan.price)} sẽ được tích hợp sớm`,
    });
  };

  if (user?.isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Premium</Text>
            <View style={{ width: 24 }} />
          </View>

          <Card style={styles.premiumActiveCard}>
            <Text style={styles.premiumIcon}>⭐</Text>
            <Text style={styles.premiumTitle}>Bạn đang là thành viên Premium!</Text>
            <Text style={styles.premiumSubtitle}>
              Cảm ơn bạn đã ủng hộ NutriScanVN
            </Text>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumInfoText}>
                Hết hạn: {user.premiumExpiresAt ? new Date(user.premiumExpiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
              </Text>
            </View>
            <Button
              title="Quản lý đăng ký"
              onPress={() => navigation.navigate('ManageSubscription')}
              variant="outline"
              fullWidth
            />
          </Card>

          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>✨ Tính năng Premium của bạn</Text>
            {features.map((feature, index) => (
              <FeatureItem key={index} icon={feature.icon} text={feature.text} checked />
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Nâng cấp Premium</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>⭐</Text>
          <Text style={styles.heroTitle}>Nâng cấp trải nghiệm của bạn</Text>
          <Text style={styles.heroSubtitle}>
            Mở khóa toàn bộ tính năng để đạt mục tiêu sức khỏe nhanh hơn
          </Text>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansSection}>
          <PlanCard
            plan={plans.monthly}
            selected={selectedPlan === 'monthly'}
            onPress={() => setSelectedPlan('monthly')}
          />
          <PlanCard
            plan={plans.yearly}
            selected={selectedPlan === 'yearly'}
            onPress={() => setSelectedPlan('yearly')}
          />
        </View>

        {/* Features Comparison */}
        <Card style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>So sánh gói</Text>
          
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonSectionTitle}>💎 Premium</Text>
            {features.map((feature, index) => (
              <FeatureItem key={index} icon={feature.icon} text={feature.text} checked />
            ))}
          </View>

          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonSectionTitle}>🆓 Miễn phí</Text>
            {freeFeatures.map((feature, index) => (
              <FeatureItem key={index} icon={feature.icon} text={feature.text} />
            ))}
          </View>
        </Card>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Button
            title={`Đăng ký ${plans[selectedPlan].name} - ${formatCurrency(plans[selectedPlan].price)}`}
            onPress={handleSubscribe}
            fullWidth
            size="large"
          />
          {plans[selectedPlan].savings > 0 && (
            <Text style={styles.savingsText}>
              💰 Tiết kiệm {formatCurrency(plans[selectedPlan].savings)}/năm
            </Text>
          )}
          <Text style={styles.disclaimer}>
            Đăng ký sẽ tự động gia hạn. Bạn có thể hủy bất cứ lúc nào.
          </Text>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustSection}>
          <TrustBadge icon="shield-checkmark" text="Thanh toán an toàn" />
          <TrustBadge icon="close-circle" text="Hủy bất cứ lúc nào" />
          <TrustBadge icon="refresh" text="Hoàn tiền 7 ngày" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PlanCard: React.FC<{
  plan: any;
  selected: boolean;
  onPress: () => void;
}> = ({ plan, selected, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Card
      style={[
        styles.planCard,
        selected && styles.planCardSelected,
        plan.popular && styles.planCardPopular,
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>PHỔ BIẾN NHẤT</Text>
        </View>
      )}
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        {selected && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
        )}
      </View>
      <Text style={styles.planPrice}>
        {formatCurrency(plan.price)}
        <Text style={styles.planDuration}>/{plan.duration}</Text>
      </Text>
      {plan.savings > 0 && (
        <Text style={styles.planSavings}>
          Tiết kiệm {formatCurrency(plan.savings)}
        </Text>
      )}
    </Card>
  </TouchableOpacity>
);

const FeatureItem: React.FC<{
  icon: string;
  text: string;
  checked?: boolean;
}> = ({ icon, text, checked = false }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
    {checked && <Ionicons name="checkmark" size={20} color={Colors.success} />}
  </View>
);

const TrustBadge: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}> = ({ icon, text }) => (
  <View style={styles.trustBadge}>
    <Ionicons name={icon} size={24} color={Colors.primary} />
    <Text style={styles.trustText}>{text}</Text>
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
  heroSection: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  planCard: {
    position: 'relative',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    backgroundColor: Colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: Colors.white,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  planPrice: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  planDuration: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
  },
  planSavings: {
    fontSize: fontSize.sm,
    color: Colors.success,
    marginTop: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  comparisonCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  comparisonTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.lg,
  },
  comparisonSection: {
    marginBottom: spacing.lg,
  },
  comparisonSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    width: 24,
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  ctaSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  savingsText: {
    fontSize: fontSize.sm,
    color: Colors.success,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: fontWeight.bold,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  trustBadge: {
    alignItems: 'center',
    flex: 1,
  },
  trustText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  premiumActiveCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
  },
  premiumIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  premiumTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  premiumSubtitle: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  premiumInfo: {
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  premiumInfoText: {
    fontSize: fontSize.sm,
    color: Colors.text,
    textAlign: 'center',
  },
  featuresCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
});

export default SubscriptionScreen;
