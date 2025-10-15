import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import { useAuthStore } from '@store/authStore';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  const [darkMode, setDarkMode] = useState(user?.darkMode ?? false);

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    updateUser({ notificationsEnabled: value });
  };

  const handleToggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    updateUser({ darkMode: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Cài đặt</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Account Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <SettingItem
            icon="person-outline"
            label="Thông tin cá nhân"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingItem
            icon="mail-outline"
            label="Email"
            value={user?.email}
            onPress={() => {}}
          />
          <SettingItem
            icon="lock-closed-outline"
            label="Đổi mật khẩu"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </Card>

        {/* Goals Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Mục tiêu & Sở thích</Text>
          <SettingItem
            icon="trophy-outline"
            label="Mục tiêu"
            value={user?.goal || 'Chưa đặt'}
            onPress={() => navigation.navigate('EditGoals')}
          />
          <SettingItem
            icon="nutrition-outline"
            label="Sở thích ăn uống"
            onPress={() => navigation.navigate('DietaryPreferences')}
          />
          <SettingItem
            icon="warning-outline"
            label="Dị ứng"
            onPress={() => navigation.navigate('Allergies')}
          />
        </Card>

        {/* Preferences Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chỉnh</Text>
          <SettingToggle
            icon="notifications-outline"
            label="Thông báo"
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />
          <SettingToggle
            icon="moon-outline"
            label="Chế độ tối"
            value={darkMode}
            onValueChange={handleToggleDarkMode}
          />
          <SettingItem
            icon="language-outline"
            label="Ngôn ngữ"
            value="Tiếng Việt"
            onPress={() => navigation.navigate('Language')}
          />
          <SettingItem
            icon="fitness-outline"
            label="Đơn vị đo"
            value={user?.unitSystem === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, ft)'}
            onPress={() => navigation.navigate('Units')}
          />
        </Card>

        {/* Premium Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          <SettingItem
            icon="star-outline"
            label="Nâng cấp Premium"
            badge={user?.isPremium ? 'Premium' : undefined}
            badgeColor={Colors.secondary}
            onPress={() => navigation.navigate('Subscription')}
          />
          {user?.isPremium && (
            <SettingItem
              icon="card-outline"
              label="Quản lý đăng ký"
              onPress={() => navigation.navigate('ManageSubscription')}
            />
          )}
        </Card>

        {/* Support Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <SettingItem
            icon="help-circle-outline"
            label="Trung tâm trợ giúp"
            onPress={() => navigation.navigate('HelpCenter')}
          />
          <SettingItem
            icon="chatbubbles-outline"
            label="Liên hệ hỗ trợ"
            onPress={() => navigation.navigate('ContactSupport')}
          />
          <SettingItem
            icon="star-half-outline"
            label="Đánh giá ứng dụng"
            onPress={() => {}}
          />
          <SettingItem
            icon="share-social-outline"
            label="Chia sẻ ứng dụng"
            onPress={() => {}}
          />
        </Card>

        {/* About Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Về ứng dụng</Text>
          <SettingItem
            icon="document-text-outline"
            label="Điều khoản dịch vụ"
            onPress={() => navigation.navigate('Terms')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Chính sách bảo mật"
            onPress={() => navigation.navigate('Privacy')}
          />
          <SettingItem
            icon="information-circle-outline"
            label="Phiên bản"
            value="1.0.0"
            onPress={() => {}}
          />
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.section, styles.dangerSection]}>
          <SettingItem
            icon="trash-outline"
            label="Xóa tài khoản"
            textColor={Colors.error}
            onPress={() => navigation.navigate('DeleteAccount')}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: string;
  badgeColor?: string;
  textColor?: string;
  onPress: () => void;
}> = ({ icon, label, value, badge, badgeColor, textColor, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemLeft}>
      <Ionicons name={icon} size={22} color={textColor || Colors.text} />
      <Text style={[styles.settingItemLabel, textColor && { color: textColor }]}>
        {label}
      </Text>
    </View>
    <View style={styles.settingItemRight}>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor || Colors.primary }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {value && <Text style={styles.settingItemValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
    </View>
  </TouchableOpacity>
);

const SettingToggle: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}> = ({ icon, label, value, onValueChange }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingItemLeft}>
      <Ionicons name={icon} size={22} color={Colors.text} />
      <Text style={styles.settingItemLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.gray300, true: Colors.primary + '60' }}
      thumbColor={value ? Colors.primary : Colors.gray400}
    />
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
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemLabel: {
    fontSize: fontSize.md,
    color: Colors.text,
    marginLeft: spacing.md,
    fontWeight: fontWeight.medium,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingItemValue: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: Colors.white,
    fontWeight: fontWeight.bold,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
});

export default SettingsScreen;
