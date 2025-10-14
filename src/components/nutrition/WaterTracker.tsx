import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { NumberFormatter } from '@/utils/formatters';
import Button from '@/components/common/Button';

export interface WaterTrackerProps {
  currentAmount: number;
  goalAmount: number;
  onAddWater: (amount: number) => void;
  onUndo?: () => void;
  quickAmounts?: number[];
  style?: any;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  currentAmount,
  goalAmount,
  onAddWater,
  onUndo,
  quickAmounts = [250, 500, 750, 1000],
  style,
}) => {
  const [animatedHeight] = useState(new Animated.Value(0));
  const [showRipple, setShowRipple] = useState(false);
  
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
  const remaining = Math.max(0, goalAmount - currentAmount);

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const handleAddWater = (amount: number) => {
    setShowRipple(true);
    onAddWater(amount);
    
    // Hide ripple effect after animation
    setTimeout(() => {
      setShowRipple(false);
    }, 800);
  };

  const renderWaterGlass = () => {
    const glassHeight = 200;
    const glassWidth = 120;
    
    return (
      <View style={styles.glassContainer}>
        <Svg width={glassWidth} height={glassHeight} style={styles.glass}>
          <Defs>
            <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={Colors.water} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={Colors.waterLight} stopOpacity="0.6" />
            </LinearGradient>
            <LinearGradient id="rippleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={Colors.water} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={Colors.waterLight} stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          
          {/* Glass outline */}
          <Path
            d={`M 20 20 L 20 ${glassHeight - 30} Q 20 ${glassHeight - 10} 40 ${glassHeight - 10} L ${glassWidth - 40} ${glassHeight - 10} Q ${glassWidth - 20} ${glassHeight - 10} ${glassWidth - 20} ${glassHeight - 30} L ${glassWidth - 20} 20 Q ${glassWidth - 20} 10 ${glassWidth - 30} 10 L 30 10 Q 20 10 20 20 Z`}
            stroke={Colors.primary}
            strokeWidth="3"
            fill="transparent"
          />
          
          {/* Water fill */}
          <Animated.View
            style={[
              styles.waterFill,
              {
                height: animatedHeight.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, glassHeight - 50],
                }),
                bottom: 15,
              },
            ]}
          >
            <Path
              d={`M 25 ${glassHeight - 35} L 25 ${glassHeight - 30} Q 25 ${glassHeight - 15} 40 ${glassHeight - 15} L ${glassWidth - 40} ${glassHeight - 15} Q ${glassWidth - 25} ${glassHeight - 15} ${glassWidth - 25} ${glassHeight - 30} L ${glassWidth - 25} ${glassHeight - 35} Z`}
              fill="url(#waterGradient)"
            />
          </Animated.View>
          
          {/* Ripple effect */}
          {showRipple && (
            <Path
              d={`M 30 ${glassHeight - 40} Q 60 ${glassHeight - 50} 90 ${glassHeight - 40} Q 60 ${glassHeight - 30} 30 ${glassHeight - 40} Z`}
              fill="url(#rippleGradient)"
            />
          )}
        </Svg>
        
        {/* Water level indicator */}
        <View style={styles.levelIndicator}>
          <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>
          {NumberFormatter.formatVolume(currentAmount)}
        </Text>
        <Text style={styles.statLabel}>Đã uống</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statValue}>
          {NumberFormatter.formatVolume(goalAmount)}
        </Text>
        <Text style={styles.statLabel}>Mục tiêu</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: Colors.primary }]}>
          {NumberFormatter.formatVolume(remaining)}
        </Text>
        <Text style={styles.statLabel}>Còn lại</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Thêm nhanh:</Text>
      <View style={styles.quickActions}>
        {quickAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.quickActionButton}
            onPress={() => handleAddWater(amount)}
          >
            <Ionicons name="water" size={16} color={Colors.primary} />
            <Text style={styles.quickActionText}>
              {NumberFormatter.formatVolume(amount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Button
        title="Thêm nước"
        onPress={() => handleAddWater(250)}
        variant="primary"
        style={styles.addButton}
        icon={<Ionicons name="add" size={20} color={Colors.white} />}
      />
      
      {onUndo && currentAmount > 0 && (
        <Button
          title="Hoàn tác"
          onPress={onUndo}
          variant="outline"
          style={styles.undoButton}
          icon={<Ionicons name="arrow-undo" size={20} color={Colors.primary} />}
        />
      )}
    </View>
  );

  const renderMotivationalMessage = () => {
    let message = '';
    let icon = '';
    
    if (percentage >= 100) {
      message = 'Tuyệt vời! Bạn đã hoàn thành mục tiêu uống nước hôm nay! 🎉';
      icon = 'trophy';
    } else if (percentage >= 75) {
      message = 'Gần hoàn thành rồi! Hãy uống thêm một chút nữa! 💪';
      icon = 'trending-up';
    } else if (percentage >= 50) {
      message = 'Bạn đang làm rất tốt! Tiếp tục duy trì nhé! 👍';
      icon = 'thumbs-up';
    } else if (percentage >= 25) {
      message = 'Hãy nhớ uống nước thường xuyên trong ngày! 💧';
      icon = 'time';
    } else {
      message = 'Hãy bắt đầu uống nước để duy trì sức khỏe tốt! 🌟';
      icon = 'star';
    }

    return (
      <View style={styles.motivationContainer}>
        <Ionicons name={icon as any} size={20} color={Colors.primary} />
        <Text style={styles.motivationText}>{message}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderWaterGlass()}
      {renderStats()}
      {renderMotivationalMessage()}
      {renderQuickActions()}
      {renderActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: lightTheme.spacing.lg,
    alignItems: 'center',
    ...lightTheme.shadows.md,
  },
  
  // Glass
  glassContainer: {
    position: 'relative',
    marginBottom: lightTheme.spacing.lg,
  },
  glass: {
    // SVG styles handled in component
  },
  waterFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: lightTheme.borderRadius.sm,
  },
  levelIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -15 }],
    backgroundColor: Colors.overlay,
    borderRadius: lightTheme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  percentageText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
    backgroundColor: Colors.lightGray,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.gray,
    marginHorizontal: lightTheme.spacing.md,
  },

  // Motivation
  motivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.lg,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: lightTheme.spacing.sm,
    lineHeight: 20,
  },

  // Quick actions
  quickActionsContainer: {
    width: '100%',
    marginBottom: lightTheme.spacing.lg,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: lightTheme.spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: lightTheme.spacing.sm,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: lightTheme.spacing.md,
  },
  addButton: {
    flex: 2,
  },
  undoButton: {
    flex: 1,
  },
});

export default WaterTracker;