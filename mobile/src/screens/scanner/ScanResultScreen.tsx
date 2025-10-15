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
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import { ScannedFood } from '@types';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { MEAL_TYPES } from '@constants/config';
import { formatConfidence } from '@utils/formatters';
import Toast from 'react-native-toast-message';

const ScanResultScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { scannedFoods, imageUri } = route.params;
  const [selectedFood, setSelectedFood] = useState<ScannedFood>(scannedFoods[0]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [servingSize, setServingSize] = useState('1');
  const [selectedMealType, setSelectedMealType] = useState<keyof typeof MEAL_TYPES>('lunch');
  const [notes, setNotes] = useState('');

  const handleLogFood = async () => {
    // Log food to diary
    const foodData = {
      foodName: selectedFood.nameVi || selectedFood.name,
      mealType: selectedMealType,
      servingSize: parseFloat(servingSize),
      calories: selectedFood.calories * parseFloat(servingSize),
      protein: selectedFood.protein * parseFloat(servingSize),
      carbohydrates: selectedFood.carbohydrates * parseFloat(servingSize),
      fats: selectedFood.fats * parseFloat(servingSize),
      fiber: selectedFood.fiber * parseFloat(servingSize),
      scanned: true,
      confidenceScore: selectedFood.confidence,
      imageUrl: imageUri,
      notes,
    };

    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào nhật ký',
      text2: `${foodData.foodName} - ${Math.round(foodData.calories)} kcal`,
    });

    setShowLogModal(false);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Kết quả quét</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Scanned Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.scannedImage} />
          <View style={styles.imageOverlay}>
            <View style={styles.scanBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.scanBadgeText}>
                Đã phát hiện {scannedFoods.length} món
              </Text>
            </View>
          </View>
        </View>

        {/* Multiple Foods Detected */}
        {scannedFoods.length > 1 && (
          <View style={styles.foodSelectorContainer}>
            <Text style={styles.selectorTitle}>Chọn món ăn:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {scannedFoods.map((food: ScannedFood, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.foodSelectorButton,
                    selectedFood === food && styles.foodSelectorButtonActive,
                  ]}
                  onPress={() => setSelectedFood(food)}
                >
                  <Text style={styles.foodSelectorText}>
                    {food.nameVi || food.name}
                  </Text>
                  <Text style={styles.foodSelectorConfidence}>
                    {formatConfidence(food.confidence)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Food Details */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsHeaderLeft}>
              <Text style={styles.foodName}>
                {selectedFood.nameVi || selectedFood.name}
              </Text>
              {selectedFood.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.verifiedText}>Đã xác minh</Text>
                </View>
              )}
            </View>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Độ chính xác</Text>
              <Text style={styles.confidenceValue}>
                {formatConfidence(selectedFood.confidence)}
              </Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{selectedFood.category}</Text>
            </View>
            {selectedFood.cuisine && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{selectedFood.cuisine}</Text>
              </View>
            )}
          </View>

          {/* Nutrition Info */}
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionTitle}>Thông tin dinh dưỡng</Text>
            <View style={styles.nutritionGrid}>
              <NutritionCard
                icon="🔥"
                label="Calories"
                value={selectedFood.calories}
                unit="kcal"
                color={Colors.calories}
              />
              <NutritionCard
                icon="🥩"
                label="Protein"
                value={selectedFood.protein}
                unit="g"
                color={Colors.protein}
              />
              <NutritionCard
                icon="🍞"
                label="Carbs"
                value={selectedFood.carbohydrates}
                unit="g"
                color={Colors.carbs}
              />
              <NutritionCard
                icon="🥑"
                label="Fats"
                value={selectedFood.fats}
                unit="g"
                color={Colors.fats}
              />
              <NutritionCard
                icon="🌾"
                label="Fiber"
                value={selectedFood.fiber}
                unit="g"
                color={Colors.fiber}
              />
              <NutritionCard
                icon="📏"
                label="Khẩu phần"
                value={selectedFood.servingSize}
                unit=""
                color={Colors.gray600}
              />
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Thêm vào nhật ký"
            onPress={() => setShowLogModal(true)}
            fullWidth
            icon={<Ionicons name="add-circle" size={20} color={Colors.white} />}
          />
          <Button
            title="Quét lại"
            variant="outline"
            fullWidth
            icon={<Ionicons name="camera-outline" size={20} color={Colors.primary} />}
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        {/* AI Notice */}
        <Card style={styles.noticeCard}>
          <Ionicons name="information-circle" size={24} color={Colors.accent} />
          <Text style={styles.noticeText}>
            Kết quả được tạo bởi AI và có thể không chính xác 100%. Bạn có thể điều
            chỉnh thông tin trước khi lưu.
          </Text>
        </Card>
      </ScrollView>

      {/* Log Food Modal */}
      <Modal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Thêm vào nhật ký"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalFoodName}>
            {selectedFood.nameVi || selectedFood.name}
          </Text>

          {/* Meal Type Selector */}
          <View style={styles.mealTypeSection}>
            <Text style={styles.modalLabel}>Bữa ăn</Text>
            <View style={styles.mealTypeGrid}>
              {Object.entries(MEAL_TYPES).map(([key, meal]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === key && styles.mealTypeButtonActive,
                    { borderLeftColor: meal.color },
                  ]}
                  onPress={() => setSelectedMealType(key as keyof typeof MEAL_TYPES)}
                >
                  <Text style={styles.mealTypeIcon}>{meal.icon}</Text>
                  <Text
                    style={[
                      styles.mealTypeText,
                      selectedMealType === key && styles.mealTypeTextActive,
                    ]}
                  >
                    {meal.labelVi}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Serving Size */}
          <Input
            label="Khẩu phần"
            placeholder="1"
            keyboardType="numeric"
            value={servingSize}
            onChangeText={setServingSize}
            rightIcon="restaurant-outline"
          />

          {/* Nutrition Summary */}
          <Card style={styles.nutritionSummary} padding="small">
            <Text style={styles.summaryTitle}>Tổng dinh dưỡng:</Text>
            <Text style={styles.summaryText}>
              🔥 {Math.round(selectedFood.calories * parseFloat(servingSize || '1'))} kcal •
              🥩 {Math.round(selectedFood.protein * parseFloat(servingSize || '1'))}g •
              🍞 {Math.round(selectedFood.carbohydrates * parseFloat(servingSize || '1'))}g •
              🥑 {Math.round(selectedFood.fats * parseFloat(servingSize || '1'))}g
            </Text>
          </Card>

          {/* Notes */}
          <Input
            label="Ghi chú (tùy chọn)"
            placeholder="Thêm ghi chú..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Button title="Lưu vào nhật ký" onPress={handleLogFood} fullWidth />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const NutritionCard: React.FC<{
  icon: string;
  label: string;
  value: number | string;
  unit: string;
  color: string;
}> = ({ icon, label, value, unit, color }) => (
  <View style={[styles.nutritionCard, { borderLeftColor: color }]}>
    <Text style={styles.nutritionIcon}>{icon}</Text>
    <Text style={styles.nutritionLabel}>{label}</Text>
    <Text style={[styles.nutritionValue, { color }]}>
      {typeof value === 'number' ? Math.round(value) : value}
      {unit}
    </Text>
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
  imageContainer: {
    position: 'relative',
    height: 250,
    marginBottom: spacing.md,
  },
  scannedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  scanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  scanBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  foodSelectorContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  selectorTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  foodSelectorButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: Colors.gray200,
  },
  foodSelectorButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  foodSelectorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  foodSelectorConfidence: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailsHeaderLeft: {
    flex: 1,
  },
  foodName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: Colors.success,
    fontWeight: fontWeight.medium,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  confidenceValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: Colors.text,
  },
  nutritionSection: {
    marginTop: spacing.md,
  },
  nutritionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nutritionCard: {
    width: '48%',
    backgroundColor: Colors.gray100,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
  },
  nutritionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  nutritionLabel: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nutritionValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  noticeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.accent + '10',
    gap: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modalContent: {
    gap: spacing.md,
  },
  modalFoodName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  mealTypeSection: {
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderLeftWidth: 4,
    gap: spacing.sm,
  },
  mealTypeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  mealTypeIcon: {
    fontSize: 20,
  },
  mealTypeText: {
    fontSize: fontSize.sm,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  mealTypeTextActive: {
    color: Colors.primary,
    fontWeight: fontWeight.bold,
  },
  nutritionSummary: {
    backgroundColor: Colors.gray100,
  },
  summaryTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
});

export default ScanResultScreen;
