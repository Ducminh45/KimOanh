import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import { useFoodStore } from '@store/foodStore';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { Food } from '@types';

const FoodDatabaseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { searchFoods } = useFoodStore();

  const categories = [
    { id: 'main_dish', name: 'Món chính', icon: '🍜' },
    { id: 'protein', name: 'Protein', icon: '🍖' },
    { id: 'vegetable', name: 'Rau củ', icon: '🥬' },
    { id: 'fruit', name: 'Trái cây', icon: '🍎' },
    { id: 'grain', name: 'Ngũ cốc', icon: '🌾' },
    { id: 'dairy', name: 'Sữa', icon: '🥛' },
    { id: 'snack', name: 'Đồ ăn vặt', icon: '🍿' },
    { id: 'beverage', name: 'Đồ uống', icon: '🥤' },
  ];

  useEffect(() => {
    loadFoods();
  }, [searchQuery, selectedCategory]);

  const loadFoods = async () => {
    const results = await searchFoods(searchQuery);
    setFoods(results);
  };

  const handleFoodPress = (food: Food) => {
    setSelectedFood(food);
    setShowDetailModal(true);
  };

  const handleAddFood = () => {
    setShowDetailModal(false);
    // Navigate to add food log screen
    navigation.navigate('AddFoodLog', { food: selectedFood });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Cơ sở dữ liệu thực phẩm</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray500} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thực phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.gray400}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.gray500} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food List */}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FoodCard food={item} onPress={handleFoodPress} />}
        contentContainerStyle={styles.foodList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Không tìm thấy thực phẩm' : 'Tìm kiếm thực phẩm'}
            </Text>
          </View>
        }
      />

      {/* Food Detail Modal */}
      {selectedFood && (
        <Modal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedFood.nameVi || selectedFood.name}
        >
          <View style={styles.modalContent}>
            {selectedFood.imageUrl && (
              <Image source={{ uri: selectedFood.imageUrl }} style={styles.foodImage} />
            )}
            
            <View style={styles.nutritionGrid}>
              <NutritionItem label="Calories" value={`${selectedFood.calories} kcal`} />
              <NutritionItem label="Protein" value={`${selectedFood.protein}g`} />
              <NutritionItem label="Carbs" value={`${selectedFood.carbohydrates}g`} />
              <NutritionItem label="Fats" value={`${selectedFood.fats}g`} />
              <NutritionItem label="Fiber" value={`${selectedFood.fiber}g`} />
              <NutritionItem
                label="Phần ăn"
                value={`${selectedFood.servingSize} ${selectedFood.servingUnit}`}
              />
            </View>

            <View style={styles.badges}>
              {selectedFood.isVerified && (
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.badgeText}>Đã xác minh</Text>
                </View>
              )}
              {selectedFood.cuisine && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selectedFood.cuisine}</Text>
                </View>
              )}
            </View>

            <Button title="Thêm vào nhật ký" onPress={handleAddFood} fullWidth />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const FoodCard: React.FC<{ food: Food; onPress: (food: Food) => void }> = ({
  food,
  onPress,
}) => (
  <Card style={styles.foodCard} onPress={() => onPress(food)}>
    <View style={styles.foodCardContent}>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{food.nameVi || food.name}</Text>
        <Text style={styles.foodCategory}>{food.category}</Text>
        <View style={styles.foodMacros}>
          <Text style={styles.macroText}>🔥 {food.calories} kcal</Text>
          <Text style={styles.macroText}>• 🥩 {food.protein}g</Text>
          <Text style={styles.macroText}>• 🍞 {food.carbohydrates}g</Text>
          <Text style={styles.macroText}>• 🥑 {food.fats}g</Text>
        </View>
      </View>
      {food.imageUrl && (
        <Image source={{ uri: food.imageUrl }} style={styles.foodThumbnail} />
      )}
    </View>
  </Card>
);

const NutritionItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.nutritionItem}>
    <Text style={styles.nutritionLabel}>{label}</Text>
    <Text style={styles.nutritionValue}>{value}</Text>
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
    borderColor: Colors.gray300,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  categoriesContainer: {
    maxHeight: 60,
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryText: {
    fontSize: fontSize.sm,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  foodList: {
    padding: spacing.lg,
  },
  foodCard: {
    marginBottom: spacing.md,
  },
  foodCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  foodCategory: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  foodMacros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  macroText: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginRight: spacing.xs,
  },
  foodThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginLeft: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    color: Colors.textSecondary,
  },
  modalContent: {
    gap: spacing.md,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: Colors.gray100,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  nutritionLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nutritionValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: Colors.text,
  },
});

export default FoodDatabaseScreen;
