import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { Food } from '@types';

interface FoodItemProps {
  food: Food;
  onPress?: () => void;
  onAddPress?: () => void;
  showAddButton?: boolean;
}

const FoodItem: React.FC<FoodItemProps> = ({
  food,
  onPress,
  onAddPress,
  showAddButton = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Food Image */}
        {food.imageUrl ? (
          <Image source={{ uri: food.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant" size={24} color={Colors.gray400} />
          </View>
        )}

        {/* Food Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {food.nameVi || food.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {food.category} {food.cuisine && `• ${food.cuisine}`}
          </Text>
          <View style={styles.nutrition}>
            <Text style={styles.nutritionText}>🔥 {Math.round(food.calories)} kcal</Text>
            <Text style={styles.nutritionText}>• 🥩 {Math.round(food.protein)}g</Text>
            <Text style={styles.nutritionText}>• 🍞 {Math.round(food.carbohydrates)}g</Text>
          </View>
          {food.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.verifiedText}>Đã xác minh</Text>
            </View>
          )}
        </View>

        {/* Add Button */}
        {showAddButton && onAddPress && (
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Ionicons name="add-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nutrition: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginRight: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: Colors.success,
    fontWeight: fontWeight.medium,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.sm,
  },
});

export default FoodItem;
