import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@store/authStore';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐ Premium</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.streakCount || 0}</Text>
            <Text style={styles.statLabel}>Chuỗi ngày</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Bữa ăn</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Thành tựu</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <MenuItem icon="⚙️" label="Cài đặt" />
          <MenuItem icon="🎯" label="Mục tiêu" />
          <MenuItem icon="📊" label="Thống kê" />
          <MenuItem icon="⭐" label="Premium" />
          <MenuItem icon="ℹ️" label="Về ứng dụng" />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <TouchableOpacity style={styles.menuItem}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuLabel}>{label}</Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', padding: spacing.xl, backgroundColor: Colors.white },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 40, fontWeight: fontWeight.bold, color: Colors.white },
  name: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  email: { fontSize: fontSize.md, color: Colors.textSecondary },
  premiumBadge: { marginTop: spacing.md, backgroundColor: Colors.secondary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  premiumText: { color: Colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  statsContainer: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.white, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: Colors.primary },
  statLabel: { fontSize: fontSize.sm, color: Colors.textSecondary, marginTop: spacing.xs },
  section: { margin: spacing.lg, backgroundColor: Colors.white, borderRadius: borderRadius.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  menuIcon: { fontSize: 24, marginRight: spacing.md },
  menuLabel: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.medium },
  menuArrow: { fontSize: 24, color: Colors.textSecondary },
  logoutButton: { margin: spacing.lg, backgroundColor: Colors.error, padding: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center' },
  logoutText: { color: Colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
});

export default ProfileScreen;
