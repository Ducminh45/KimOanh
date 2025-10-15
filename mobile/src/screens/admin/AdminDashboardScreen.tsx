import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalScans: number;
  totalFoodLogs: number;
  todayRevenue: number;
  monthRevenue: number;
}

const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 1234,
    activeUsers: 856,
    premiumUsers: 187,
    totalScans: 45678,
    totalFoodLogs: 123456,
    todayRevenue: 2970000,
    monthRevenue: 89100000,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: '1', type: 'user_registered', user: 'user@example.com', time: '5 phút trước' },
    { id: '2', type: 'premium_purchase', user: 'premium@example.com', time: '15 phút trước' },
    { id: '3', type: 'food_scanned', user: 'scanner@example.com', time: '30 phút trước' },
  ]);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    // In real app, call admin API
    // const response = await adminApi.getStats();
    // setStats(response.data);
  };

  const StatCard: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    color: string;
    trend?: string;
  }> = ({ icon, label, value, color, trend }) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <Text style={styles.statTrend}>{trend}</Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>NutriScanVN Management</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            label="Tổng người dùng"
            value={stats.totalUsers.toLocaleString()}
            color={Colors.primary}
            trend="+12% so với tháng trước"
          />
          <StatCard
            icon="pulse"
            label="Đang hoạt động"
            value={stats.activeUsers.toLocaleString()}
            color={Colors.accent}
          />
          <StatCard
            icon="star"
            label="Premium"
            value={stats.premiumUsers.toLocaleString()}
            color={Colors.warning}
            trend="+8% conversion"
          />
          <StatCard
            icon="camera"
            label="Tổng quét"
            value={stats.totalScans.toLocaleString()}
            color={Colors.secondary}
          />
          <StatCard
            icon="restaurant"
            label="Food Logs"
            value={stats.totalFoodLogs.toLocaleString()}
            color={Colors.protein}
          />
          <StatCard
            icon="cash"
            label="Doanh thu tháng"
            value={`${(stats.monthRevenue / 1000000).toFixed(1)}M VND`}
            color={Colors.success}
          />
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quản lý nhanh</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="people-outline"
              label="Users"
              onPress={() => navigation.navigate('AdminUsers')}
            />
            <ActionButton
              icon="restaurant-outline"
              label="Foods"
              onPress={() => navigation.navigate('AdminFoods')}
            />
            <ActionButton
              icon="receipt-outline"
              label="Reports"
              onPress={() => navigation.navigate('AdminReports')}
            />
            <ActionButton
              icon="settings-outline"
              label="Settings"
              onPress={() => navigation.navigate('AdminSettings')}
            />
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name={
                    activity.type === 'user_registered'
                      ? 'person-add'
                      : activity.type === 'premium_purchase'
                      ? 'star'
                      : 'camera'
                  }
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  {activity.type === 'user_registered' && 'Đăng ký mới'}
                  {activity.type === 'premium_purchase' && 'Mua Premium'}
                  {activity.type === 'food_scanned' && 'Quét thực phẩm'}
                </Text>
                <Text style={styles.activityUser}>{activity.user}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </Card>

        {/* System Health */}
        <Card style={styles.healthCard}>
          <Text style={styles.sectionTitle}>Trạng thái hệ thống</Text>
          <HealthIndicator label="API Server" status="healthy" />
          <HealthIndicator label="Database" status="healthy" />
          <HealthIndicator label="Redis Cache" status="healthy" />
          <HealthIndicator label="AI Service" status="healthy" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons name={icon} size={32} color={Colors.primary} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const HealthIndicator: React.FC<{
  label: string;
  status: 'healthy' | 'warning' | 'error';
}> = ({ label, status }) => (
  <View style={styles.healthItem}>
    <Text style={styles.healthLabel}>{label}</Text>
    <View style={styles.healthStatus}>
      <View
        style={[
          styles.healthDot,
          {
            backgroundColor:
              status === 'healthy'
                ? Colors.success
                : status === 'warning'
                ? Colors.warning
                : Colors.error,
          },
        ]}
      />
      <Text style={styles.healthText}>
        {status === 'healthy' ? 'Healthy' : status === 'warning' ? 'Warning' : 'Error'}
      </Text>
    </View>
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
  subtitle: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statTrend: {
    fontSize: fontSize.xs,
    color: Colors.success,
    marginTop: spacing.xs,
  },
  actionsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    width: '22%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.md,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: Colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  activityCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
  },
  activityUser: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  healthCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  healthLabel: {
    fontSize: fontSize.md,
    color: Colors.text,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
});

export default AdminDashboardScreen;
