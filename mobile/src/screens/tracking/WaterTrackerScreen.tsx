import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AnimatedWaterGlass from '@components/nutrition/AnimatedWaterGlass';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Toast from 'react-native-toast-message';

const WaterTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentWater, setCurrentWater] = useState(1200); // ml
  const [waterGoal, setWaterGoal] = useState(2000); // ml
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [history, setHistory] = useState<{ amount: number; time: string }[]>([]);

  const addWater = (amount: number) => {
    const newAmount = Math.min(currentWater + amount, waterGoal * 2);
    setCurrentWater(newAmount);
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    setHistory([{ amount, time: timeStr }, ...history].slice(0, 10));

    Toast.show({
      type: 'success',
      text1: 'Đã thêm nước',
      text2: `+${amount}ml`,
      position: 'bottom',
    });
  };

  const undoLast = () => {
    if (history.length > 0) {
      const lastEntry = history[0];
      setCurrentWater(Math.max(0, currentWater - lastEntry.amount));
      setHistory(history.slice(1));
      
      Toast.show({
        type: 'info',
        text1: 'Đã hoàn tác',
        text2: `-${lastEntry.amount}ml`,
        position: 'bottom',
      });
    }
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0 && amount <= 5000) {
      addWater(amount);
      setShowCustomModal(false);
      setCustomAmount('');
    }
  };

  const progress = (currentWater / waterGoal) * 100;
  const remainingWater = Math.max(0, waterGoal - currentWater);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Theo dõi nước</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Water Glass Animation */}
        <View style={styles.glassSection}>
          <AnimatedWaterGlass current={currentWater} goal={waterGoal} size={180} />
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentWater}ml</Text>
              <Text style={styles.statLabel}>Đã uống</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{remainingWater}ml</Text>
              <Text style={styles.statLabel}>Còn lại</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{waterGoal}ml</Text>
              <Text style={styles.statLabel}>Mục tiêu</Text>
            </View>
          </View>
        </Card>

        {/* Quick Add Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thêm nhanh</Text>
          <View style={styles.quickAddGrid}>
            <QuickAddButton amount={250} onPress={addWater} icon="💧" />
            <QuickAddButton amount={500} onPress={addWater} icon="🥤" />
            <QuickAddButton amount={750} onPress={addWater} icon="🧃" />
            <QuickAddButton amount={1000} onPress={addWater} icon="🍶" />
          </View>
        </View>

        {/* Custom Amount */}
        <View style={styles.section}>
          <Button
            title="Thêm lượng tùy chỉnh"
            onPress={() => setShowCustomModal(true)}
            variant="outline"
            fullWidth
            icon={<Ionicons name="add-circle-outline" size={20} color={Colors.primary} />}
          />
        </View>

        {/* History */}
        {history.length > 0 && (
          <Card style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Lịch sử hôm nay</Text>
              <TouchableOpacity onPress={undoLast}>
                <Text style={styles.undoButton}>Hoàn tác</Text>
              </TouchableOpacity>
            </View>
            {history.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <Ionicons name="water" size={20} color={Colors.accent} />
                <Text style={styles.historyAmount}>+{entry.amount}ml</Text>
                <Text style={styles.historyTime}>{entry.time}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Mẹo uống nước</Text>
          <Text style={styles.tipsText}>
            • Uống 1 cốc nước ngay khi thức dậy{'\n'}
            • Uống nước trước mỗi bữa ăn 30 phút{'\n'}
            • Mang theo chai nước bên mình{'\n'}
            • Đặt nhắc nhở uống nước định kỳ
          </Text>
        </Card>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Thêm lượng nước tùy chỉnh"
        size="small"
      >
        <Input
          label="Lượng nước (ml)"
          placeholder="Nhập số ml"
          keyboardType="numeric"
          value={customAmount}
          onChangeText={setCustomAmount}
          autoFocus
        />
        <Button
          title="Thêm"
          onPress={handleCustomAmount}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </Modal>
    </SafeAreaView>
  );
};

const QuickAddButton: React.FC<{
  amount: number;
  onPress: (amount: number) => void;
  icon: string;
}> = ({ amount, onPress, icon }) => (
  <TouchableOpacity
    style={styles.quickAddButton}
    onPress={() => onPress(amount)}
  >
    <Text style={styles.quickAddIcon}>{icon}</Text>
    <Text style={styles.quickAddAmount}>{amount}ml</Text>
  </TouchableOpacity>
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
  glassSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray300,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAddButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  quickAddIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  quickAddAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.accent,
  },
  historyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  undoButton: {
    fontSize: fontSize.md,
    color: Colors.primary,
    fontWeight: fontWeight.medium,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  historyAmount: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  historyTime: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: Colors.primary + '10',
  },
  tipsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default WaterTrackerScreen;
