import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanGestureHandler, State } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { FoodItem, FoodItemData } from './FoodItem';

export interface SwipeableFoodCardProps {
  food: FoodItemData;
  onPress?: (food: FoodItemData) => void;
  onEdit?: (food: FoodItemData) => void;
  onDelete?: (food: FoodItemData) => void;
  onFavorite?: (food: FoodItemData) => void;
  swipeThreshold?: number;
  style?: any;
}

export const SwipeableFoodCard: React.FC<SwipeableFoodCardProps> = ({
  food,
  onPress,
  onEdit,
  onDelete,
  onFavorite,
  swipeThreshold = 80,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      const offset = lastOffset.current + translationX;

      let toValue = 0;
      let shouldTriggerAction = false;
      let actionType: 'edit' | 'delete' | null = null;

      // Determine swipe direction and action
      if (offset > swipeThreshold || velocityX > 500) {
        // Swipe right - Edit action
        toValue = swipeThreshold * 2;
        shouldTriggerAction = Math.abs(offset) > swipeThreshold;
        actionType = 'edit';
      } else if (offset < -swipeThreshold || velocityX < -500) {
        // Swipe left - Delete action
        toValue = -swipeThreshold * 2;
        shouldTriggerAction = Math.abs(offset) > swipeThreshold;
        actionType = 'delete';
      }

      // Animate to final position
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start(() => {
        lastOffset.current = toValue;
        
        // Trigger action if threshold exceeded
        if (shouldTriggerAction) {
          setTimeout(() => {
            if (actionType === 'edit' && onEdit) {
              onEdit(food);
            } else if (actionType === 'delete' && onDelete) {
              onDelete(food);
            }
            
            // Reset position after action
            resetPosition();
          }, 100);
        }
      });
    }
  };

  const resetPosition = () => {
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const renderLeftAction = () => (
    <View style={styles.leftAction}>
      <Ionicons name="create-outline" size={24} color={Colors.white} />
      <Text style={styles.actionText}>Chỉnh sửa</Text>
    </View>
  );

  const renderRightAction = () => (
    <View style={styles.rightAction}>
      <Ionicons name="trash-outline" size={24} color={Colors.white} />
      <Text style={styles.actionText}>Xóa</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Background actions */}
      <View style={styles.actionsContainer}>
        {renderLeftAction()}
        {renderRightAction()}
      </View>

      {/* Swipeable content */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View
          style={[
            styles.swipeableContent,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <FoodItem
            food={food}
            onPress={onPress}
            onFavoritePress={onFavorite}
            showAddButton={false}
            style={styles.foodItem}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: lightTheme.spacing.sm,
    overflow: 'hidden',
    borderRadius: lightTheme.borderRadius.md,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftAction: {
    flex: 1,
    backgroundColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
  },
  rightAction: {
    flex: 1,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
  },
  actionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  swipeableContent: {
    backgroundColor: Colors.surface,
  },
  foodItem: {
    marginBottom: 0,
    ...lightTheme.shadows.sm,
  },
});

export default SwipeableFoodCard;