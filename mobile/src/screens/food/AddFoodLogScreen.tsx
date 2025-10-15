import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import Card from '@components/common/Card';
import Modal from '@components/common/Modal';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { MEAL_TYPES } from '@constants/config';
import { useFoodStore } from '@store/foodStore';
import Toast from 'react-native-toast-message';

const AddFoodLogScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { food } = route.params || {};
  
  const [foodName, setFoodName] = useState(food?.name || '');
  const [mealType, setMealType] = useState<keyof typeof MEAL_TYPES>('lunch');
  const [servingSize, setServingSize] = useState('1');
  const [calories, setCalories] = useState(food?.calories?.toString() || '');
  const [protein, setProtein] = useState(food?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(food?.carbohydrates?.toString() || '');
  const [fats, setFats] = useState(food?.fats?.toString() || '');
  const [fiber, setFiber] = useState(food?.fiber?.toString() || '');
  const [notes, setNotes] = useState('');
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);

  const { logFood } = useFoodStore();

  const handleSave = async () => {
    if (!foodName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập tên thực phẩm',
      });
      return;
    }

    if (!calories || parseFloat(calories) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập calories hợp lệ',
      });
      return;
    }

    const foodData = {
      foodId: food?.id,
      foodName: foodName.trim(),
      mealType,
      servingSize: parseFloat(servingSize),
      servingUnit: 'portion',
      calories: parseFloat(calories),
      protein: parseFloat(protein) || 0,
      carbohydrates: parseFloat(carbs) || 0,
      fats: parseFloat(fats) || 0,
      fiber: parseFloat(fiber) || 0,
      notes: notes.trim(),
    };

    const success = await logFood(foodData);

    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Đã thêm vào nhật ký',
        text2: `${foodName} - ${calories} kcal`,
      });
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Không thể thêm thực phẩm',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Thêm thực phẩm</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Meal Type Selector */}
        <TouchableOpacity
          style={styles.mealTypeSelector}
          onPress={() => setShowMealTypeModal(true)}
        >
          <View style={styles.mealTypeSelectorContent}>
            <Text style={styles.mealTypeIcon}>
              {MEAL_TYPES[mealType].icon}
            </Text>
            <View style={styles.mealTypeInfo}>
              <Text style={styles.mealTypeLabel}>Bữa ăn</Text>
              <Text style={styles.mealTypeValue}>
                {MEAL_TYPES[mealType].labelVi}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>

        {/* Food Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thực phẩm</Text>
          
          <Input
            label="Tên thực phẩm"
            placeholder="VD: Phở bò"
            value={foodName}
            onChangeText={setFoodName}
            leftIcon="restaurant-outline"
            required
          />

          <Input
            label="Khẩu phần"
            placeholder="1"
            value={servingSize}
            onChangeText={setServingSize}
            keyboardType="numeric"
            leftIcon="resize-outline"
          />
        </Card>

        {/* Nutrition Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin dinh dưỡng</Text>
          
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionInputHalf}>
              <Input
                label="Calories (kcal)"
                placeholder="0"
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                required
                containerStyle={styles.noMargin}
              />
            </View>
            <View style={styles.nutritionInputHalf}>
              <Input
                label="Protein (g)"
                placeholder="0"
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                containerStyle={styles.noMargin}
              />
            </View>
          </View>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionInputHalf}>
              <Input
                label="Carbs (g)"
                placeholder="0"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                containerStyle={styles.noMargin}
              />
            </View>
            <View style={styles.nutritionInputHalf}>
              <Input
                label="Fats (g)"
                placeholder="0"
                value={fats}
                onChangeText={setFats}
                keyboardType="numeric"
                containerStyle={styles.noMargin}
              />
            </View>
          </View>

          <Input
            label="Fiber (g)"
            placeholder="0"
            value={fiber}
            onChangeText={setFiber}
            keyboardType="numeric"
          />
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <Input
            label="Ghi chú (tùy chọn)"
            placeholder="Thêm ghi chú về món ăn..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </Card>

        <Button
          title="Thêm vào nhật ký"
          onPress={handleSave}
          fullWidth
          icon={<Ionicons name="checkmark-circle" size={20} color={Colors.white} />}
        />
      </ScrollView>

      {/* Meal Type Modal */}
      <Modal
        visible={showMealTypeModal}
        onClose={() => setShowMealTypeModal(false)}
        title="Chọn bữa ăn"
        size="small"
      >
        <View style={styles.modalContent}>
          {Object.entries(MEAL_TYPES).map(([key, meal]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.mealTypeOption,
                { borderLeftColor: meal.color },
              ]}
              onPress={() => {
                setMealType(key as keyof typeof MEAL_TYPES);
                setShowMealTypeModal(false);
              }}
            >
              <Text style={styles.mealTypeOptionIcon}>{meal.icon}</Text>
              <Text style={styles.mealTypeOptionText}>{meal.labelVi}</Text>
              {mealType === key && (
                <Ionicons name="checkmark" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  saveButton: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  content: {
    padding: spacing.lg,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  mealTypeSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  mealTypeInfo: {
    justifyContent: 'center',
  },
  mealTypeLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  mealTypeValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  nutritionInputHalf: {
    flex: 1,
  },
  noMargin: {
    marginBottom: 0,
  },
  modalContent: {
    gap: spacing.sm,
  },
  mealTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    gap: spacing.md,
  },
  mealTypeOptionIcon: {
    fontSize: 24,
  },
  mealTypeOptionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
  },
});

export default AddFoodLogScreen;
