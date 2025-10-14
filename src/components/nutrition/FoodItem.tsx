import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import { NumberFormatter } from '@/utils/formatters';
import Badge from '@/components/common/Badge';

export interface FoodItemData {
  id: string;
  name: string;
  nameVi: string;
  brand?: string;
  category: string;
  images: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    servingUnit: string;
  };
  verified: boolean;
  isFavorite?: boolean;
}

export interface FoodItemProps {
  food: FoodItemData;
  onPress?: (food: FoodItemData) => void;
  onFavoritePress?: (food: FoodItemData) => void;
  onAddPress?: (food: FoodItemData) => void;
  showAddButton?: boolean;
  showFavoriteButton?: boolean;
  showNutrition?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  style?: any;
}

export const FoodItem: React.FC<FoodItemProps> = ({
  food,
  onPress,
  onFavoritePress,
  onAddPress,
  showAddButton = true,
  showFavoriteButton = true,
  showNutrition = true,
  variant = 'default',
  style,
}) => {
  const handlePress = () => {
    onPress?.(food);
  };

  const handleFavoritePress = () => {
    onFavoritePress?.(food);
  };

  const handleAddPress = () => {
    onAddPress?.(food);
  };

  const renderImage = () => {
    const imageUri = food.images[0];
    
    return (
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="restaurant" size={24} color={Colors.textSecondary} />
          </View>
        )}
        {food.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {food.nameVi || food.name}
            </Text>
            {food.brand && (
              <Text style={styles.brand} numberOfLines={1}>
                {food.brand}
              </Text>
            )}
          </View>
          
          {showFavoriteButton && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={food.isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={food.isFavorite ? Colors.error : Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.categoryContainer}>
          <Badge variant="neutral" size="small" outline>
            {food.category}
          </Badge>
        </View>

        {showNutrition && (
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {NumberFormatter.formatCalories(food.nutrition.calories)}
              </Text>
              <Text style={styles.nutritionLabel}>calo</Text>
            </View>
            
            <View style={styles.nutritionDivider} />
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {food.nutrition.protein.toFixed(1)}g
              </Text>
              <Text style={styles.nutritionLabel}>protein</Text>
            </View>
            
            <View style={styles.nutritionDivider} />
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {food.nutrition.carbs.toFixed(1)}g
              </Text>
              <Text style={styles.nutritionLabel}>carbs</Text>
            </View>
            
            <View style={styles.nutritionDivider} />
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {food.nutrition.fat.toFixed(1)}g
              </Text>
              <Text style={styles.nutritionLabel}>fat</Text>
            </View>
          </View>
        )}

        <View style={styles.servingInfo}>
          <Text style={styles.servingText}>
            Khẩu phần: {food.nutrition.servingSize}{food.nutrition.servingUnit}
          </Text>
        </View>
      </View>
    );
  };

  const renderActions = () => {
    if (!showAddButton) return null;

    return (
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.container, styles.compactContainer, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {renderImage()}
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={2}>
            {food.nameVi || food.name}
          </Text>
          <Text style={styles.compactCalories}>
            {NumberFormatter.formatCalories(food.nutrition.calories)} calo
          </Text>
        </View>
        {renderActions()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {renderImage()}
      {renderContent()}
      {renderActions()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...lightTheme.shadows.sm,
  },
  compactContainer: {
    padding: lightTheme.spacing.sm,
  },
  
  // Image
  imageContainer: {
    position: 'relative',
    marginRight: lightTheme.spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: lightTheme.borderRadius.md,
  },
  placeholderImage: {
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },

  // Content
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: lightTheme.spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: lightTheme.spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  brand: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },

  // Category
  categoryContainer: {
    marginBottom: lightTheme.spacing.sm,
  },

  // Nutrition
  nutritionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  nutritionLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nutritionDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.lightGray,
    marginHorizontal: lightTheme.spacing.xs,
  },

  // Serving info
  servingInfo: {
    marginBottom: lightTheme.spacing.xs,
  },
  servingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Actions
  actions: {
    marginLeft: lightTheme.spacing.sm,
  },
  addButton: {
    padding: 4,
  },

  // Compact variant
  compactContent: {
    flex: 1,
    marginLeft: lightTheme.spacing.sm,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 18,
  },
  compactCalories: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default FoodItem;