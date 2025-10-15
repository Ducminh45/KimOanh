import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@components/common/Card';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import { formatRelativeTime } from '@utils/formatters';

interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  imageUrl?: string;
  postType: 'general' | 'meal' | 'progress' | 'achievement';
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

const CommunityFeedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      userId: '1',
      authorName: 'Nguyễn Văn A',
      content: 'Đã giảm được 5kg sau 1 tháng theo dõi với NutriScanVN! 🎉💪',
      postType: 'progress',
      likesCount: 24,
      commentsCount: 8,
      isLiked: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      userId: '2',
      authorName: 'Trần Thị B',
      content: 'Bữa sáng healthy hôm nay: Phở gà + rau củ 🍜',
      postType: 'meal',
      likesCount: 15,
      commentsCount: 3,
      isLiked: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userId: '3',
      authorName: 'Lê Văn C',
      content: 'Đạt được chuỗi 7 ngày theo dõi liên tục! 🔥',
      postType: 'achievement',
      likesCount: 42,
      commentsCount: 12,
      isLiked: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard post={item} onLike={handleLike} navigation={navigation} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cộng đồng</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="trophy-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton label="Dành cho bạn" active />
        <TabButton label="Đang theo dõi" active={false} />
        <TabButton label="Hot" active={false} />
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const TabButton: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <TouchableOpacity style={[styles.tab, active && styles.tabActive]}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const PostCard: React.FC<{
  post: Post;
  onLike: (postId: string) => void;
  navigation: any;
}> = ({ post, onLike, navigation }) => {
  const postTypeIcons = {
    general: '💬',
    meal: '🍽️',
    progress: '📊',
    achievement: '🏆',
  };

  return (
    <Card style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{post.authorName.charAt(0)}</Text>
        </View>
        <View style={styles.postHeaderInfo}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <View style={styles.postMeta}>
            <Text style={styles.postType}>
              {postTypeIcons[post.postType]} {post.postType}
            </Text>
            <Text style={styles.postTime}>
              • {formatRelativeTime(post.createdAt, true)}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.gray500} />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Post Image */}
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLiked ? Colors.error : Colors.gray500}
          />
          <Text style={[styles.actionText, post.isLiked && styles.actionTextActive]}>
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
        >
          <Ionicons name="chatbubble-outline" size={22} color={Colors.gray500} />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={22} color={Colors.gray500} />
        </TouchableOpacity>
      </View>
    </Card>
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
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    color: Colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: fontWeight.bold,
  },
  feedList: {
    padding: spacing.lg,
  },
  postCard: {
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.white,
  },
  postHeaderInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postType: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  postTime: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  postContent: {
    fontSize: fontSize.md,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  actionTextActive: {
    color: Colors.error,
  },
});

export default CommunityFeedScreen;
