import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  fullName: string;
  profileImageUrl?: string;
  score: number;
  change: number; // +3, -1, 0
}

const LeaderboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');
  
  const leaderboard: LeaderboardEntry[] = [
    { id: '1', rank: 1, userId: '1', fullName: 'Nguyễn Văn A', score: 2850, change: 0 },
    { id: '2', rank: 2, userId: '2', fullName: 'Trần Thị B', score: 2720, change: 2 },
    { id: '3', rank: 3, userId: '3', fullName: 'Lê Văn C', score: 2650, change: -1 },
    { id: '4', rank: 4, userId: '4', fullName: 'Phạm Thị D', score: 2580, change: 1 },
    { id: '5', rank: 5, userId: '5', fullName: 'Hoàng Văn E', score: 2510, change: -2 },
    { id: '6', rank: 6, userId: '6', fullName: 'Đặng Thị F', score: 2440, change: 3 },
    { id: '7', rank: 7, userId: '7', fullName: 'Vũ Văn G', score: 2380, change: 0 },
    { id: '8', rank: 8, userId: '8', fullName: 'Bùi Thị H', score: 2320, change: -1 },
  ];

  const currentUserRank = 15;
  const currentUserScore = 1850;

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return Colors.gray500;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Bảng xếp hạng</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <PeriodButton
            label="Tuần này"
            active={period === 'weekly'}
            onPress={() => setPeriod('weekly')}
          />
          <PeriodButton
            label="Tháng này"
            active={period === 'monthly'}
            onPress={() => setPeriod('monthly')}
          />
          <PeriodButton
            label="Mọi thời đại"
            active={period === 'all_time'}
            onPress={() => setPeriod('all_time')}
          />
        </View>

        {/* Current User Rank */}
        <Card style={styles.userRankCard}>
          <View style={styles.userRankContent}>
            <View style={styles.userRankInfo}>
              <Text style={styles.userRankLabel}>Xếp hạng của bạn</Text>
              <View style={styles.userRankDetails}>
                <Text style={styles.userRank}>#{currentUserRank}</Text>
                <Text style={styles.userScore}>{currentUserScore} điểm</Text>
              </View>
            </View>
            <Ionicons name="trophy" size={48} color={Colors.secondary} />
          </View>
          <Text style={styles.userRankMotivation}>
            Tiếp tục phấn đấu để lên top! 💪
          </Text>
        </Card>

        {/* Top 3 Podium */}
        <Card style={styles.podiumCard}>
          <Text style={styles.podiumTitle}>🏆 Top 3 xuất sắc nhất</Text>
          <View style={styles.podium}>
            {/* 2nd Place */}
            <View style={styles.podiumPlace}>
              <View style={[styles.podiumAvatar, styles.podiumAvatar2]}>
                <Text style={styles.podiumAvatarText}>
                  {leaderboard[1]?.fullName.charAt(0)}
                </Text>
              </View>
              <View style={[styles.podiumPillar, styles.pillar2]}>
                <Text style={styles.podiumRank}>🥈</Text>
                <Text style={styles.podiumName}>{leaderboard[1]?.fullName}</Text>
                <Text style={styles.podiumScore}>{leaderboard[1]?.score}</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View style={styles.podiumPlace}>
              <View style={[styles.podiumAvatar, styles.podiumAvatar1]}>
                <Text style={styles.podiumAvatarText}>
                  {leaderboard[0]?.fullName.charAt(0)}
                </Text>
              </View>
              <View style={[styles.podiumPillar, styles.pillar1]}>
                <Text style={styles.podiumRank}>🥇</Text>
                <Text style={styles.podiumName}>{leaderboard[0]?.fullName}</Text>
                <Text style={styles.podiumScore}>{leaderboard[0]?.score}</Text>
              </View>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumPlace}>
              <View style={[styles.podiumAvatar, styles.podiumAvatar3]}>
                <Text style={styles.podiumAvatarText}>
                  {leaderboard[2]?.fullName.charAt(0)}
                </Text>
              </View>
              <View style={[styles.podiumPillar, styles.pillar3]}>
                <Text style={styles.podiumRank}>🥉</Text>
                <Text style={styles.podiumName}>{leaderboard[2]?.fullName}</Text>
                <Text style={styles.podiumScore}>{leaderboard[2]?.score}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Full Leaderboard */}
        <Card style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>Bảng xếp hạng đầy đủ</Text>
          <FlatList
            data={leaderboard}
            renderItem={({ item }) => <RankingRow entry={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </Card>

        {/* How Points Work */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>📖 Cách tính điểm</Text>
          <View style={styles.infoList}>
            <InfoItem icon="🍽️" text="Log bữa ăn: +10 điểm" />
            <InfoItem icon="💧" text="Uống đủ nước: +5 điểm" />
            <InfoItem icon="💪" text="Tập luyện: +15 điểm" />
            <InfoItem icon="⚖️" text="Cân nặng: +5 điểm" />
            <InfoItem icon="🔥" text="Chuỗi ngày: +50 điểm" />
            <InfoItem icon="🎯" text="Đạt mục tiêu: +20 điểm" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const PeriodButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.periodButton, active && styles.periodButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.periodButtonText, active && styles.periodButtonTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const RankingRow: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const changeColor = entry.change > 0 ? Colors.success : entry.change < 0 ? Colors.error : Colors.textSecondary;
  const changeIcon = entry.change > 0 ? '↑' : entry.change < 0 ? '↓' : '–';

  return (
    <View style={styles.rankingRow}>
      <View style={styles.rankingLeft}>
        <Text style={styles.rankingRank}>{getRankIcon(entry.rank)}</Text>
        <View style={styles.rankingAvatar}>
          <Text style={styles.rankingAvatarText}>{entry.fullName.charAt(0)}</Text>
        </View>
        <Text style={styles.rankingName}>{entry.fullName}</Text>
      </View>
      <View style={styles.rankingRight}>
        <Text style={styles.rankingScore}>{entry.score}</Text>
        <View style={[styles.rankingChange, { backgroundColor: changeColor + '20' }]}>
          <Text style={[styles.rankingChangeText, { color: changeColor }]}>
            {changeIcon} {Math.abs(entry.change)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const InfoItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoText}>{text}</Text>
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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: Colors.text,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  userRankCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: Colors.primary + '10',
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userRankInfo: {
    flex: 1,
  },
  userRankLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userRankDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  userRank: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  userScore: {
    fontSize: fontSize.lg,
    color: Colors.text,
  },
  userRankMotivation: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  podiumCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  podiumTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 200,
  },
  podiumPlace: {
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
  },
  podiumAvatar1: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  podiumAvatar2: {
    backgroundColor: '#C0C0C0',
    borderColor: '#C0C0C0',
  },
  podiumAvatar3: {
    backgroundColor: '#CD7F32',
    borderColor: '#CD7F32',
  },
  podiumAvatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.white,
  },
  podiumPillar: {
    width: 90,
    backgroundColor: Colors.gray200,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    alignItems: 'center',
    padding: spacing.sm,
  },
  pillar1: {
    height: 150,
    backgroundColor: '#FFD700' + '40',
  },
  pillar2: {
    height: 120,
    backgroundColor: '#C0C0C0' + '40',
  },
  pillar3: {
    height: 100,
    backgroundColor: '#CD7F32' + '40',
  },
  podiumRank: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  podiumName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  podiumScore: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  leaderboardCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  leaderboardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  rankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingRank: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    width: 40,
  },
  rankingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankingAvatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.white,
  },
  rankingName: {
    fontSize: fontSize.md,
    color: Colors.text,
    flex: 1,
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  rankingScore: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  rankingChange: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  rankingChangeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
});

export default LeaderboardScreen;
