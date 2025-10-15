import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Toast from 'react-native-toast-message';

interface Recipe {
  id: string;
  name: string;
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  tags: string[];
}

const RecipeDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const [servings, setServings] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const recipe: Recipe = {
    id: '1',
    name: 'Phở Gà Healthy',
    imageUrl: 'https://via.placeholder.com/400x250',
    prepTime: 20,
    cookTime: 60,
    servings: 4,
    difficulty: 'medium',
    calories: 350,
    protein: 25,
    carbs: 45,
    fats: 6,
    ingredients: [
      { name: 'Thịt gà', amount: '500g' },
      { name: 'Bánh phở', amount: '400g' },
      { name: 'Hành tây', amount: '1 củ' },
      { name: 'Gừng', amount: '50g' },
      { name: 'Hành lá', amount: '1 bó' },
      { name: 'Rau thơm', amount: '1 bó' },
      { name: 'Nước dùng', amount: '2 lít' },
      { name: 'Gia vị', amount: 'Vừa đủ' },
    ],
    instructions: [
      'Luộc gà với hành tây và gừng đập dập trong 30 phút',
      'Vớt gà ra để nguội, xé thịt thành từng miếng',
      'Lọc nước dùng, nêm nếm gia vị cho vừa ăn',
      'Trụng bánh phở qua nước sôi',
      'Xếp bánh phở vào tô, cho thịt gà lên trên',
      'Chan nước dùng nóng vào tô',
      'Cho hành lá, rau thơm, và gia vị lên trên',
      'Thưởng thức khi còn nóng',
    ],
    tags: ['Việt Nam', 'Soup', 'High Protein', 'Low Fat'],
  };

  const difficultyColors = {
    easy: Colors.success,
    medium: Colors.secondary,
    hard: Colors.error,
  };

  const difficultyLabels = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Toast.show({
      type: 'success',
      text1: isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích',
    });
  };

  const handleStartCooking = () => {
    setCookingMode(true);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCookingMode(false);
      Toast.show({
        type: 'success',
        text1: 'Hoàn thành!',
        text2: 'Chúc bạn ngon miệng! 😋',
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (cookingMode) {
    return (
      <SafeAreaView style={styles.cookingModeContainer}>
        <View style={styles.cookingHeader}>
          <TouchableOpacity onPress={() => setCookingMode(false)}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.cookingStepCounter}>
            Bước {currentStep + 1}/{recipe.instructions.length}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.cookingContent}>
          <View style={styles.cookingProgressBar}>
            <View
              style={[
                styles.cookingProgressFill,
                {
                  width: `${((currentStep + 1) / recipe.instructions.length) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.cookingStepTitle}>
            Bước {currentStep + 1}
          </Text>
          <Text style={styles.cookingStepText}>
            {recipe.instructions[currentStep]}
          </Text>

          <View style={styles.cookingTimerContainer}>
            <Ionicons name="timer-outline" size={32} color={Colors.primary} />
            <Text style={styles.cookingTimerText}>Timer (optional)</Text>
          </View>
        </ScrollView>

        <View style={styles.cookingControls}>
          <Button
            title="Trước"
            variant="outline"
            onPress={handlePrevStep}
            disabled={currentStep === 0}
            style={{ flex: 1 }}
          />
          <Button
            title={
              currentStep === recipe.instructions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'
            }
            onPress={handleNextStep}
            style={{ flex: 2, marginLeft: spacing.sm }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {recipe.imageUrl && (
            <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? Colors.error : Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Recipe Info */}
        <View style={styles.content}>
          <Text style={styles.recipeName}>{recipe.name}</Text>

          <View style={styles.metaInfo}>
            <MetaItem icon="time-outline" text={`${recipe.prepTime + recipe.cookTime} phút`} />
            <MetaItem icon="people-outline" text={`${recipe.servings} người`} />
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyColors[recipe.difficulty] + '20' },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: difficultyColors[recipe.difficulty] },
                ]}
              >
                {difficultyLabels[recipe.difficulty]}
              </Text>
            </View>
          </View>

          {/* Nutrition */}
          <Card style={styles.nutritionCard}>
            <Text style={styles.sectionTitle}>Dinh dưỡng (1 khẩu phần)</Text>
            <View style={styles.nutritionGrid}>
              <NutritionItem label="Calories" value={`${recipe.calories} kcal`} />
              <NutritionItem label="Protein" value={`${recipe.protein}g`} />
              <NutritionItem label="Carbs" value={`${recipe.carbs}g`} />
              <NutritionItem label="Fats" value={`${recipe.fats}g`} />
            </View>
          </Card>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {recipe.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Servings Adjuster */}
          <Card style={styles.servingsCard}>
            <Text style={styles.sectionTitle}>Khẩu phần</Text>
            <View style={styles.servingsAdjuster}>
              <TouchableOpacity
                style={styles.servingsButton}
                onPress={() => setServings(Math.max(1, servings - 1))}
              >
                <Ionicons name="remove" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.servingsValue}>{servings}</Text>
              <TouchableOpacity
                style={styles.servingsButton}
                onPress={() => setServings(servings + 1)}
              >
                <Ionicons name="add" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Ingredients */}
          <Card style={styles.ingredientsCard}>
            <Text style={styles.sectionTitle}>Nguyên liệu</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet} />
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientAmount}>
                  {ingredient.amount}
                </Text>
              </View>
            ))}
          </Card>

          {/* Instructions */}
          <Card style={styles.instructionsCard}>
            <Text style={styles.sectionTitle}>Hướng dẫn</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </Card>

          {/* Action Buttons */}
          <Button
            title="Bắt đầu nấu"
            onPress={handleStartCooking}
            fullWidth
            icon={<Ionicons name="restaurant" size={20} color={Colors.white} />}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            title="Thêm vào danh sách mua sắm"
            variant="outline"
            fullWidth
            icon={<Ionicons name="cart-outline" size={20} color={Colors.primary} />}
            onPress={() => {
              Toast.show({
                type: 'success',
                text1: 'Đã thêm vào danh sách',
              });
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MetaItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}> = ({ icon, text }) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon} size={16} color={Colors.textSecondary} />
    <Text style={styles.metaText}>{text}</Text>
  </View>
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
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  recipeName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  nutritionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: Colors.primary,
    fontWeight: fontWeight.medium,
  },
  servingsCard: {
    marginBottom: spacing.md,
  },
  servingsAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  servingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  ingredientsCard: {
    marginBottom: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: spacing.md,
  },
  ingredientName: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
  },
  ingredientAmount: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  instructionsCard: {
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  instructionNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: Colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  cookingModeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  cookingStepCounter: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  cookingContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  cookingProgressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    marginBottom: spacing.xxl,
  },
  cookingProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  cookingStepTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.lg,
  },
  cookingStepText: {
    fontSize: fontSize.xl,
    color: Colors.text,
    lineHeight: 32,
  },
  cookingTimerContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    padding: spacing.xl,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.lg,
  },
  cookingTimerText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    marginTop: spacing.sm,
  },
  cookingControls: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    gap: spacing.sm,
  },
});

export default RecipeDetailScreen;
