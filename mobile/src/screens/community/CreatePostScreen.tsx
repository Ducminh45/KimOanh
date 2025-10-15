import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Button from '@components/common/Button';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Toast from 'react-native-toast-message';

const CreatePostScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'general' | 'meal' | 'progress' | 'achievement'>('general');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const postTypes = [
    { value: 'general', label: 'Chung', icon: '💬' },
    { value: 'meal', label: 'Bữa ăn', icon: '🍽️' },
    { value: 'progress', label: 'Tiến trình', icon: '📊' },
    { value: 'achievement', label: 'Thành tựu', icon: '🏆' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập nội dung',
      });
      return;
    }

    setIsPosting(true);

    // Simulate API call
    setTimeout(() => {
      setIsPosting(false);
      Toast.show({
        type: 'success',
        text1: 'Đã đăng bài',
        text2: 'Bài viết của bạn đã được chia sẻ',
      });
      navigation.goBack();
    }, 1500);
  };

  const characterCount = content.length;
  const maxCharacters = 500;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo bài viết</Text>
        <TouchableOpacity onPress={handlePost} disabled={isPosting || !content.trim()}>
          <Text
            style={[
              styles.postButton,
              (!content.trim() || isPosting) && styles.postButtonDisabled,
            ]}
          >
            {isPosting ? 'Đang đăng...' : 'Đăng'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Post Type Selector */}
        <View style={styles.typeSelector}>
          <Text style={styles.typeSelectorLabel}>Loại bài viết:</Text>
          <View style={styles.typeButtons}>
            {postTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  postType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setPostType(type.value as any)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    postType === type.value && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content Input */}
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="Chia sẻ điều gì đó..."
            placeholderTextColor={Colors.gray400}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={maxCharacters}
            autoFocus
          />
          <Text style={styles.characterCount}>
            {characterCount} / {maxCharacters}
          </Text>
        </View>

        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}
            >
              <Ionicons name="close-circle" size={32} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Thêm ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Vị trí</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="happy-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Cảm xúc</Text>
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>💡 Gợi ý nội dung</Text>
          {postType === 'meal' && (
            <View style={styles.suggestionsList}>
              <SuggestionChip text="Bữa sáng healthy hôm nay 🍳" onPress={(t) => setContent(t)} />
              <SuggestionChip text="Món ăn Việt yêu thích 🇻🇳" onPress={(t) => setContent(t)} />
              <SuggestionChip text="Thử công thức mới 👨‍🍳" onPress={(t) => setContent(t)} />
            </View>
          )}
          {postType === 'progress' && (
            <View style={styles.suggestionsList}>
              <SuggestionChip text="Đã giảm được ... kg 📉" onPress={(t) => setContent(t)} />
              <SuggestionChip text="Đạt mục tiêu hôm nay 🎯" onPress={(t) => setContent(t)} />
              <SuggestionChip text="Cập nhật tiến độ tuần này 📊" onPress={(t) => setContent(t)} />
            </View>
          )}
          {postType === 'achievement' && (
            <View style={styles.suggestionsList}>
              <SuggestionChip text="Chuỗi ... ngày liên tiếp 🔥" onPress={(t) => setContent(t)} />
              <SuggestionChip text="Đạt thành tựu mới 🏆" onPress={(t) => setContent(t)} />
              <SuggestionChip text="Hoàn thành thử thách 💪" onPress={(t) => setContent(t)} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SuggestionChip: React.FC<{ text: string; onPress: (text: string) => void }> = ({
  text,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.suggestionChip}
    onPress={() => onPress(text)}
  >
    <Text style={styles.suggestionText}>{text}</Text>
  </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  postButton: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.primary,
  },
  postButtonDisabled: {
    color: Colors.gray400,
  },
  typeSelector: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  typeSelectorLabel: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray300,
    gap: spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: fontSize.sm,
    color: Colors.text,
    fontWeight: fontWeight.medium,
  },
  typeLabelActive: {
    color: Colors.white,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  contentInput: {
    fontSize: fontSize.md,
    color: Colors.text,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  imagePreview: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    gap: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: fontWeight.medium,
  },
  suggestionsSection: {
    padding: spacing.lg,
  },
  suggestionsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  suggestionText: {
    fontSize: fontSize.sm,
    color: Colors.text,
  },
});

export default CreatePostScreen;
