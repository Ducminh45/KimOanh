import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceholder from './ShimmerPlaceholder';
import { spacing } from '@constants/themes';

export const FoodCardSkeleton: React.FC = () => (
  <View style={styles.foodCard}>
    <ShimmerPlaceholder width={70} height={70} borderRadius={8} />
    <View style={styles.foodCardContent}>
      <ShimmerPlaceholder width="70%" height={18} style={{ marginBottom: spacing.sm }} />
      <ShimmerPlaceholder width="50%" height={14} style={{ marginBottom: spacing.sm }} />
      <ShimmerPlaceholder width="90%" height={12} />
    </View>
  </View>
);

export const PostCardSkeleton: React.FC = () => (
  <View style={styles.postCard}>
    {/* Header */}
    <View style={styles.postHeader}>
      <ShimmerPlaceholder width={40} height={40} borderRadius={20} />
      <View style={styles.postHeaderContent}>
        <ShimmerPlaceholder width="40%" height={16} style={{ marginBottom: spacing.xs }} />
        <ShimmerPlaceholder width="30%" height={12} />
      </View>
    </View>
    
    {/* Content */}
    <ShimmerPlaceholder width="100%" height={14} style={{ marginBottom: spacing.xs }} />
    <ShimmerPlaceholder width="80%" height={14} style={{ marginBottom: spacing.md }} />
    
    {/* Image */}
    <ShimmerPlaceholder width="100%" height={200} borderRadius={8} />
  </View>
);

export const RecipeCardSkeleton: React.FC = () => (
  <View style={styles.recipeCard}>
    <ShimmerPlaceholder width="100%" height={150} borderRadius={8} />
    <View style={styles.recipeCardContent}>
      <ShimmerPlaceholder width="80%" height={18} style={{ marginBottom: spacing.sm }} />
      <ShimmerPlaceholder width="60%" height={14} style={{ marginBottom: spacing.sm }} />
      <View style={styles.recipeCardRow}>
        <ShimmerPlaceholder width={60} height={12} />
        <ShimmerPlaceholder width={60} height={12} />
        <ShimmerPlaceholder width={60} height={12} />
      </View>
    </View>
  </View>
);

export const ListItemSkeleton: React.FC = () => (
  <View style={styles.listItem}>
    <ShimmerPlaceholder width={50} height={50} borderRadius={25} />
    <View style={styles.listItemContent}>
      <ShimmerPlaceholder width="60%" height={16} style={{ marginBottom: spacing.xs }} />
      <ShimmerPlaceholder width="40%" height={14} />
    </View>
  </View>
);

export const ChartSkeleton: React.FC = () => (
  <View style={styles.chart}>
    <ShimmerPlaceholder width="30%" height={20} style={{ marginBottom: spacing.md }} />
    <ShimmerPlaceholder width="100%" height={200} borderRadius={8} />
  </View>
);

const styles = StyleSheet.create({
  foodCard: {
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  foodCardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  postCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  postHeaderContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  recipeCard: {
    marginBottom: spacing.md,
  },
  recipeCardContent: {
    padding: spacing.md,
  },
  recipeCardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chart: {
    padding: spacing.md,
  },
});

export default {
  FoodCardSkeleton,
  PostCardSkeleton,
  RecipeCardSkeleton,
  ListItemSkeleton,
  ChartSkeleton,
};
