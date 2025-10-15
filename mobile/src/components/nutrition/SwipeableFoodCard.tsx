import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { FoodLog } from '@types';
import { formatRelativeTime, formatCalories } from '@utils/formatters';
import { MEAL_TYPES } from '@constants/config';

interface SwipeableFoodCardProps {
  foodLog: FoodLog;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SwipeableFoodCard: React.FC<SwipeableFoodCardProps> = ({
  foodLog,
  onEdit,
  onDelete,
}) => {
  const mealType = MEAL_TYPES[foodLog.mealType];

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        {onEdit && (
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons name="pencil" size={24} color={Colors.white} />
            </Animated.View>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons name="trash" size={24} color={Colors.white} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.container}>
        <View style={[styles.mealTypeBadge, { backgroundColor: mealType.color + '20' }]}>
          <Text style={styles.mealTypeIcon}>{mealType.icon}</Text>
        </View>

        <View style={styles.content}>
          {/* Food Name & Time */}
          <View style={styles.header}>
            <Text style={styles.foodName} numberOfLines={1}>
              {foodLog.foodName}
            </Text>
            <Text style={styles.time}>{formatRelativeTime(foodLog.loggedAt, true)}</Text>
          </View>

          {/* Nutrition */}
          <View style={styles.nutritionRow}>
            <Text style={styles.caloriesText}>{formatCalories(foodLog.calories)}</Text>
            <Text style={styles.macrosText}>
              • P: {Math.round(foodLog.protein)}g
              • C: {Math.round(foodLog.carbohydrates)}g
              • F: {Math.round(foodLog.fats)}g
            </Text>
          </View>

          {/* Serving Size */}
          <Text style={styles.servingSize}>
            {foodLog.servingSize} {foodLog.servingUnit}
          </Text>

          {/* Badges */}
          <View style={styles.badges}>
            {foodLog.scanned && (
              <View style={styles.badge}>
                <Ionicons name="camera" size={12} color={Colors.accent} />
                <Text style={styles.badgeText}>AI Scan</Text>
              </View>
            )}
            {foodLog.notes && (
              <View style={styles.badge}>
                <Ionicons name="document-text" size={12} color={Colors.secondary} />
                <Text style={styles.badgeText}>Ghi chú</Text>
              </View>
            )}
          </View>
        </View>

        {/* Thumbnail */}
        {foodLog.imageUrl && (
          <Image source={{ uri: foodLog.imageUrl }} style={styles.thumbnail} />
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  mealTypeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  mealTypeIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xs,
  },
  foodName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  time: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  caloriesText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
    marginRight: spacing.sm,
  },
  macrosText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  servingSize: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  badgeText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginLeft: spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
  },
  editButton: {
    backgroundColor: Colors.secondary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
});

export default SwipeableFoodCard;
