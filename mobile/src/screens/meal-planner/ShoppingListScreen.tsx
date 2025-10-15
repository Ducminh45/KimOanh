import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Toast from 'react-native-toast-message';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isChecked: boolean;
}

const ShoppingListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('vegetables');

  const categories = ['vegetables', 'protein', 'fruits', 'grains', 'dairy', 'other'];
  const categoryLabels: { [key: string]: string } = {
    vegetables: '🥬 Rau củ',
    protein: '🍖 Protein',
    fruits: '🍎 Trái cây',
    grains: '🌾 Ngũ cốc',
    dairy: '🥛 Sữa',
    other: '📦 Khác',
  };

  const [items, setItems] = useState<ShoppingItem[]>([
    { id: '1', name: 'Cà chua', quantity: '500g', category: 'vegetables', isChecked: false },
    { id: '2', name: 'Thịt gà', quantity: '1kg', category: 'protein', isChecked: false },
    { id: '3', name: 'Chuối', quantity: '1 nải', category: 'fruits', isChecked: true },
    { id: '4', name: 'Gạo lứt', quantity: '2kg', category: 'grains', isChecked: false },
    { id: '5', name: 'Sữa tươi', quantity: '1 lít', category: 'dairy', isChecked: false },
    { id: '6', name: 'Rau muống', quantity: '300g', category: 'vegetables', isChecked: false },
    { id: '7', name: 'Trứng gà', quantity: '10 quả', category: 'protein', isChecked: true },
  ]);

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    Toast.show({
      type: 'info',
      text1: 'Đã xóa món hàng',
    });
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập tên món hàng',
      });
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      quantity: itemQuantity.trim() || '1',
      category: selectedCategory,
      isChecked: false,
    };

    setItems([newItem, ...items]);
    setShowAddModal(false);
    setItemName('');
    setItemQuantity('');
    setSelectedCategory('vegetables');

    Toast.show({
      type: 'success',
      text1: 'Đã thêm món hàng',
    });
  };

  const handleClearCompleted = () => {
    setItems((prev) => prev.filter((item) => !item.isChecked));
    Toast.show({
      type: 'success',
      text1: 'Đã xóa các món đã mua',
    });
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter((item) => item.category === category);
    return acc;
  }, {} as { [key: string]: ShoppingItem[] });

  const totalItems = items.length;
  const checkedItems = items.filter((item) => item.isChecked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Danh sách mua sắm</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Tiến độ mua sắm</Text>
              <Text style={styles.progressSubtitle}>
                {checkedItems} / {totalItems} món hàng
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="Xóa đã mua"
            variant="outline"
            size="small"
            onPress={handleClearCompleted}
            icon={<Ionicons name="trash-outline" size={16} color={Colors.primary} />}
          />
          <Button
            title="Chia sẻ"
            variant="outline"
            size="small"
            icon={<Ionicons name="share-outline" size={16} color={Colors.primary} />}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Tính năng chia sẻ',
                text2: 'Sẽ được phát triển sớm',
              });
            }}
          />
        </View>

        {/* Shopping List by Category */}
        {categories.map((category) => {
          const categoryItems = groupedItems[category];
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{categoryLabels[category]}</Text>
              {categoryItems.map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </Card>
          );
        })}

        {/* Empty State */}
        {totalItems === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Danh sách trống</Text>
            <Text style={styles.emptyText}>
              Thêm món hàng để bắt đầu mua sắm
            </Text>
            <Button
              title="Thêm món hàng đầu tiên"
              onPress={() => setShowAddModal(true)}
              icon={<Ionicons name="add" size={20} color={Colors.white} />}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Mẹo mua sắm</Text>
          <Text style={styles.tipsText}>
            • Lập danh sách trước khi đi chợ{'\n'}
            • Mua theo mùa để tiết kiệm{'\n'}
            • Kiểm tra tủ lạnh trước khi mua{'\n'}
            • Không mua khi đói bụng
          </Text>
        </Card>
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm món hàng"
      >
        <View style={styles.modalContent}>
          <Input
            label="Tên món hàng"
            placeholder="VD: Cà chua"
            value={itemName}
            onChangeText={setItemName}
            autoFocus
          />

          <Input
            label="Số lượng"
            placeholder="VD: 500g"
            value={itemQuantity}
            onChangeText={setItemQuantity}
          />

          <View style={styles.categorySelector}>
            <Text style={styles.categoryLabel}>Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {categoryLabels[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Button title="Thêm món hàng" onPress={handleAddItem} fullWidth />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const ShoppingItemRow: React.FC<{
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ item, onToggle, onDelete }) => (
  <View style={styles.itemRow}>
    <TouchableOpacity
      style={styles.checkbox}
      onPress={() => onToggle(item.id)}
    >
      <Ionicons
        name={item.isChecked ? 'checkbox' : 'square-outline'}
        size={24}
        color={item.isChecked ? Colors.primary : Colors.gray400}
      />
    </TouchableOpacity>
    <View style={styles.itemInfo}>
      <Text
        style={[
          styles.itemName,
          item.isChecked && styles.itemNameChecked,
        ]}
      >
        {item.name}
      </Text>
      <Text style={styles.itemQuantity}>{item.quantity}</Text>
    </View>
    <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
      <Ionicons name="close-circle" size={22} color={Colors.gray400} />
    </TouchableOpacity>
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
  progressCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  progressSubtitle: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: borderRadius.full,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.full,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  checkbox: {
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  itemQuantity: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: Colors.accent + '10',
  },
  tipsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalContent: {
    gap: spacing.md,
  },
  categorySelector: {
    marginBottom: spacing.md,
  },
  categoryLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  categoryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },
});

export default ShoppingListScreen;
