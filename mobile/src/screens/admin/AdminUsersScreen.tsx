import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

interface User {
  id: string;
  email: string;
  fullName: string;
  isPremium: boolean;
  createdAt: string;
  lastActive: string;
  totalScans: number;
  status: 'active' | 'inactive' | 'banned';
}

const AdminUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'premium' | 'free'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    setLoading(true);
    // Mock data - in real app, call API
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'user1@example.com',
        fullName: 'Nguyễn Văn A',
        isPremium: true,
        createdAt: '2025-09-15',
        lastActive: '2 giờ trước',
        totalScans: 156,
        status: 'active',
      },
      {
        id: '2',
        email: 'user2@example.com',
        fullName: 'Trần Thị B',
        isPremium: false,
        createdAt: '2025-10-01',
        lastActive: '1 ngày trước',
        totalScans: 45,
        status: 'active',
      },
      // Add more mock users...
    ];

    const filtered = mockUsers.filter(u => {
      if (filter === 'premium') return u.isPremium;
      if (filter === 'free') return !u.isPremium;
      return true;
    });

    setUsers(filtered);
    setLoading(false);
  };

  const searchUsers = (query: string) => {
    setSearchQuery(query);
    // Implement search logic
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color={Colors.white} />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalScans}</Text>
          <Text style={styles.statLabel}>Quét</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.lastActive}</Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.createdAt}</Text>
          <Text style={styles.statLabel}>Tham gia</Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
        >
          <Ionicons name="eye-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Xem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {}}
        >
          <Ionicons name="create-outline" size={18} color={Colors.warning} />
          <Text style={[styles.actionButtonText, { color: Colors.warning }]}>
            Sửa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.banButton]}
          onPress={() => {}}
        >
          <Ionicons name="ban-outline" size={18} color={Colors.error} />
          <Text style={[styles.actionButtonText, { color: Colors.error }]}>
            Khóa
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý người dùng</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChangeText={searchUsers}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'premium' && styles.filterChipActive]}
          onPress={() => setFilter('premium')}
        >
          <Ionicons name="star" size={16} color={filter === 'premium' ? Colors.white : Colors.primary} />
          <Text style={[styles.filterText, filter === 'premium' && styles.filterTextActive]}>
            Premium
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'free' && styles.filterChipActive]}
          onPress={() => setFilter('free')}
        >
          <Text style={[styles.filterText, filter === 'free' && styles.filterTextActive]}>
            Free
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>1,234</Text>
          <Text style={styles.statTitle}>Tổng user</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>187</Text>
          <Text style={styles.statTitle}>Premium</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>856</Text>
          <Text style={styles.statTitle}>Hoạt động</Text>
        </Card>
      </View>

      {/* User List */}
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadUsers}
      />
    </SafeAreaView>
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
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.gray100,
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  filterTextActive: {
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  statTitle: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContainer: {
    padding: spacing.lg,
  },
  userCard: {
    marginBottom: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  premiumText: {
    fontSize: fontSize.xs,
    color: Colors.white,
    fontWeight: fontWeight.bold,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray200,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
  },
  userActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  viewButton: {
    backgroundColor: Colors.primary + '10',
  },
  editButton: {
    backgroundColor: Colors.warning + '10',
  },
  banButton: {
    backgroundColor: Colors.error + '10',
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: Colors.primary,
  },
});

export default AdminUsersScreen;
