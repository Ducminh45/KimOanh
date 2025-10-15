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
import * as ImagePicker from 'expo-image-picker';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import Card from '@components/common/Card';
import Modal from '@components/common/Modal';
import { useAuthStore } from '@store/authStore';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { GOALS, ACTIVITY_LEVELS } from '@constants/config';
import { calculateBMI, calculateBMR, calculateTDEE, calculateAge } from '@utils/calculations';
import { formatWeight, formatHeight } from '@utils/formatters';
import Toast from 'react-native-toast-message';
import userApi from '@services/api/userApi';

const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<keyof typeof GOALS>(
    user?.goal || 'maintain_weight'
  );
  const [selectedActivity, setSelectedActivity] = useState<keyof typeof ACTIVITY_LEVELS>(
    user?.activityLevel || 'moderately_active'
  );
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập họ tên',
      });
      return;
    }

    setIsSaving(true);

    try {
      const updates = {
        fullName: fullName.trim(),
        height: parseFloat(height),
        weight: parseFloat(weight),
        goal: selectedGoal,
        activityLevel: selectedActivity,
        profileImageUrl: profileImage,
      };

      const response = await userApi.updateProfile(updates);

      if (response.success) {
        updateUser(updates);
        Toast.show({
          type: 'success',
          text1: 'Đã cập nhật hồ sơ',
        });
        navigation.goBack();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể cập nhật hồ sơ',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const bmi = height && weight ? calculateBMI(parseFloat(weight), parseFloat(height)) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Photo */}
        <TouchableOpacity style={styles.photoSection} onPress={pickImage}>
          <View style={styles.photoContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={48} color={Colors.white} />
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.photoText}>Thay đổi ảnh đại diện</Text>
        </TouchableOpacity>

        {/* Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <Input
            label="Họ tên"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={setFullName}
            leftIcon="person-outline"
            required
          />

          <Input
            label="Email"
            value={user?.email || ''}
            editable={false}
            leftIcon="mail-outline"
            containerStyle={styles.disabledInput}
          />
        </Card>

        {/* Body Metrics */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Chỉ số cơ thể</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Chiều cao (cm)"
                placeholder="170"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                containerStyle={styles.noMargin}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Cân nặng (kg)"
                placeholder="65"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                containerStyle={styles.noMargin}
              />
            </View>
          </View>

          {bmi > 0 && (
            <View style={styles.bmiCard}>
              <Text style={styles.bmiLabel}>BMI của bạn</Text>
              <Text style={styles.bmiValue}>{bmi}</Text>
              <Text style={styles.bmiCategory}>
                {bmi < 18.5
                  ? 'Thiếu cân'
                  : bmi < 25
                  ? 'Bình thường'
                  : bmi < 30
                  ? 'Thừa cân'
                  : 'Béo phì'}
              </Text>
            </View>
          )}
        </Card>

        {/* Goals & Activity */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Mục tiêu & Hoạt động</Text>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowGoalModal(true)}
          >
            <View style={styles.selectButtonContent}>
              <Text style={styles.selectLabel}>Mục tiêu</Text>
              <Text style={styles.selectValue}>
                {GOALS[selectedGoal].icon} {GOALS[selectedGoal].labelVi}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowActivityModal(true)}
          >
            <View style={styles.selectButtonContent}>
              <Text style={styles.selectLabel}>Mức độ vận động</Text>
              <Text style={styles.selectValue}>
                {ACTIVITY_LEVELS[selectedActivity].labelVi}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Goal Modal */}
      <Modal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="Chọn mục tiêu"
        size="medium"
      >
        <View style={styles.modalContent}>
          {Object.entries(GOALS).map(([key, goal]) => (
            <TouchableOpacity
              key={key}
              style={styles.modalOption}
              onPress={() => {
                setSelectedGoal(key as keyof typeof GOALS);
                setShowGoalModal(false);
              }}
            >
              <Text style={styles.modalOptionIcon}>{goal.icon}</Text>
              <Text style={styles.modalOptionText}>{goal.labelVi}</Text>
              {selectedGoal === key && (
                <Ionicons name="checkmark" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Activity Modal */}
      <Modal
        visible={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Mức độ vận động"
        size="medium"
      >
        <View style={styles.modalContent}>
          {Object.entries(ACTIVITY_LEVELS).map(([key, level]) => (
            <TouchableOpacity
              key={key}
              style={styles.modalOption}
              onPress={() => {
                setSelectedActivity(key as keyof typeof ACTIVITY_LEVELS);
                setShowActivityModal(false);
              }}
            >
              <View style={styles.activityOptionContent}>
                <Text style={styles.modalOptionText}>{level.labelVi}</Text>
                <Text style={styles.activityDescription}>{level.description}</Text>
              </View>
              {selectedActivity === key && (
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
  saveButtonDisabled: {
    color: Colors.gray400,
  },
  content: {
    padding: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  photoText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
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
  disabledInput: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  noMargin: {
    marginBottom: 0,
  },
  bmiCard: {
    backgroundColor: Colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
  },
  bmiValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
    marginVertical: spacing.xs,
  },
  bmiCategory: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  selectButtonContent: {
    flex: 1,
  },
  selectLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  selectValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  modalContent: {
    gap: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  modalOptionText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: Colors.text,
  },
  activityOptionContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default EditProfileScreen;
