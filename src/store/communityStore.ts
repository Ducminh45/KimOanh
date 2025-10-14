import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorHandler, AppError } from '@/utils/errorHandler';
import { AnalyticsService } from '@/services/analytics/analyticsService';

// Types for community features
export interface CommunityPost {
  id: string;
  userId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified: boolean;
  };
  content: string;
  images: string[];
  type: 'progress' | 'meal' | 'workout' | 'achievement' | 'general';
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weight_loss' | 'exercise' | 'nutrition' | 'water' | 'custom';
  duration: number; // days
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants?: number;
  prize?: string;
  rules: string[];
  isActive: boolean;
  isParticipating: boolean;
  progress?: {
    current: number;
    target: number;
    rank: number;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  score: number;
  change: number; // rank change from previous period
  achievements: number;
  streakDays: number;
}

export interface Leaderboard {
  period: 'weekly' | 'monthly' | 'allTime';
  entries: LeaderboardEntry[];
  userRank?: number;
  totalParticipants: number;
  lastUpdated: string;
}

export interface CommunityState {
  // Posts
  posts: CommunityPost[];
  userPosts: CommunityPost[];
  bookmarkedPosts: CommunityPost[];
  
  // Comments
  comments: Record<string, Comment[]>; // postId -> comments
  
  // Challenges
  challenges: Challenge[];
  activeChallenges: Challenge[];
  userChallenges: Challenge[];
  
  // Leaderboards
  weeklyLeaderboard: Leaderboard | null;
  monthlyLeaderboard: Leaderboard | null;
  allTimeLeaderboard: Leaderboard | null;
  
  // Social
  following: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isOnline: boolean;
  }>;
  followers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isOnline: boolean;
  }>;
  
  // State
  isLoading: boolean;
  error: AppError | null;
  lastSyncDate: string | null;
  
  // Actions
  // Posts
  fetchPosts: (type?: 'all' | 'following' | 'trending') => Promise<void>;
  fetchUserPosts: (userId?: string) => Promise<void>;
  createPost: (data: {
    content: string;
    images?: string[];
    type: CommunityPost['type'];
    tags?: string[];
  }) => Promise<void>;
  updatePost: (id: string, data: Partial<CommunityPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  unlikePost: (id: string) => Promise<void>;
  bookmarkPost: (id: string) => Promise<void>;
  unbookmarkPost: (id: string) => Promise<void>;
  sharePost: (id: string, platform: string) => Promise<void>;
  
  // Comments
  fetchComments: (postId: string) => Promise<void>;
  createComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  likeComment: (id: string) => Promise<void>;
  unlikeComment: (id: string) => Promise<void>;
  
  // Challenges
  fetchChallenges: () => Promise<void>;
  fetchActiveChallenges: () => Promise<void>;
  fetchUserChallenges: () => Promise<void>;
  joinChallenge: (id: string) => Promise<void>;
  leaveChallenge: (id: string) => Promise<void>;
  updateChallengeProgress: (id: string, progress: number) => Promise<void>;
  
  // Leaderboards
  fetchWeeklyLeaderboard: () => Promise<void>;
  fetchMonthlyLeaderboard: () => Promise<void>;
  fetchAllTimeLeaderboard: () => Promise<void>;
  
  // Social
  fetchFollowing: () => Promise<void>;
  fetchFollowers: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  syncData: () => Promise<void>;
  clearCommunityData: () => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      // Initial state
      posts: [],
      userPosts: [],
      bookmarkedPosts: [],
      comments: {},
      challenges: [],
      activeChallenges: [],
      userChallenges: [],
      weeklyLeaderboard: null,
      monthlyLeaderboard: null,
      allTimeLeaderboard: null,
      following: [],
      followers: [],
      isLoading: false,
      error: null,
      lastSyncDate: null,

      // Posts actions
      fetchPosts: async (type = 'all') => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock API call - replace with actual API
          const mockPosts: CommunityPost[] = [
            {
              id: '1',
              userId: 'user1',
              author: {
                id: 'user1',
                firstName: 'Nguyễn',
                lastName: 'Văn A',
                avatar: 'https://example.com/avatar1.jpg',
                isVerified: true,
              },
              content: 'Vừa hoàn thành mục tiêu giảm 5kg trong 2 tháng! 🎉',
              images: ['https://example.com/progress1.jpg'],
              type: 'progress',
              tags: ['weight_loss', 'achievement'],
              likes: 24,
              comments: 8,
              shares: 3,
              isLiked: false,
              isBookmarked: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          
          set({ 
            posts: mockPosts,
            isLoading: false,
          });

          // Track analytics
          AnalyticsService.trackEvent('community_posts_viewed', {
            type,
            posts_count: mockPosts.length,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      fetchUserPosts: async (userId) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock API call
          const mockUserPosts: CommunityPost[] = [];
          
          set({ 
            userPosts: mockUserPosts,
            isLoading: false,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      createPost: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock API call
          const newPost: CommunityPost = {
            id: Date.now().toString(),
            userId: 'current_user',
            author: {
              id: 'current_user',
              firstName: 'Current',
              lastName: 'User',
              isVerified: false,
            },
            content: data.content,
            images: data.images || [],
            type: data.type,
            tags: data.tags || [],
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isBookmarked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const { posts } = get();
          set({ 
            posts: [newPost, ...posts],
            isLoading: false,
          });

          // Track analytics
          AnalyticsService.trackCommunityPost(data.type, (data.images?.length || 0) > 0);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ isLoading: false, error: appError });
          throw appError;
        }
      },

      updatePost: async (id, data) => {
        try {
          const { posts } = get();
          const updatedPosts = posts.map(post => 
            post.id === id ? { ...post, ...data, updatedAt: new Date().toISOString() } : post
          );
          
          set({ posts: updatedPosts });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      deletePost: async (id) => {
        try {
          const { posts } = get();
          const filteredPosts = posts.filter(post => post.id !== id);
          
          set({ posts: filteredPosts });

          // Track analytics
          AnalyticsService.trackEvent('community_post_deleted', { post_id: id });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      likePost: async (id) => {
        try {
          const { posts } = get();
          const updatedPosts = posts.map(post => 
            post.id === id 
              ? { ...post, likes: post.likes + 1, isLiked: true }
              : post
          );
          
          set({ posts: updatedPosts });

          // Track analytics
          AnalyticsService.trackEvent('post_liked', { post_id: id });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      unlikePost: async (id) => {
        try {
          const { posts } = get();
          const updatedPosts = posts.map(post => 
            post.id === id 
              ? { ...post, likes: Math.max(0, post.likes - 1), isLiked: false }
              : post
          );
          
          set({ posts: updatedPosts });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      bookmarkPost: async (id) => {
        try {
          const { posts, bookmarkedPosts } = get();
          const post = posts.find(p => p.id === id);
          
          if (post) {
            const updatedPosts = posts.map(p => 
              p.id === id ? { ...p, isBookmarked: true } : p
            );
            
            set({ 
              posts: updatedPosts,
              bookmarkedPosts: [{ ...post, isBookmarked: true }, ...bookmarkedPosts],
            });
          }

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      unbookmarkPost: async (id) => {
        try {
          const { posts, bookmarkedPosts } = get();
          
          const updatedPosts = posts.map(post => 
            post.id === id ? { ...post, isBookmarked: false } : post
          );
          
          const filteredBookmarks = bookmarkedPosts.filter(post => post.id !== id);
          
          set({ 
            posts: updatedPosts,
            bookmarkedPosts: filteredBookmarks,
          });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      sharePost: async (id, platform) => {
        try {
          // Track analytics
          AnalyticsService.trackSocialShare('post', platform);

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Comments actions
      fetchComments: async (postId) => {
        try {
          // Mock API call
          const mockComments: Comment[] = [];
          
          const { comments } = get();
          set({ 
            comments: { ...comments, [postId]: mockComments },
          });

        } catch (error) {
          console.error('Failed to fetch comments:', error);
        }
      },

      createComment: async (postId, content, parentId) => {
        try {
          const newComment: Comment = {
            id: Date.now().toString(),
            postId,
            userId: 'current_user',
            author: {
              id: 'current_user',
              firstName: 'Current',
              lastName: 'User',
            },
            content,
            likes: 0,
            isLiked: false,
            replies: [],
            createdAt: new Date().toISOString(),
          };

          const { comments, posts } = get();
          const postComments = comments[postId] || [];
          
          // Update comments
          set({ 
            comments: { 
              ...comments, 
              [postId]: [newComment, ...postComments] 
            },
          });

          // Update post comment count
          const updatedPosts = posts.map(post => 
            post.id === postId 
              ? { ...post, comments: post.comments + 1 }
              : post
          );
          set({ posts: updatedPosts });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      updateComment: async (id, content) => {
        try {
          const { comments } = get();
          const updatedComments = { ...comments };
          
          Object.keys(updatedComments).forEach(postId => {
            updatedComments[postId] = updatedComments[postId].map(comment =>
              comment.id === id ? { ...comment, content } : comment
            );
          });
          
          set({ comments: updatedComments });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      deleteComment: async (id) => {
        try {
          const { comments } = get();
          const updatedComments = { ...comments };
          
          Object.keys(updatedComments).forEach(postId => {
            updatedComments[postId] = updatedComments[postId].filter(comment => comment.id !== id);
          });
          
          set({ comments: updatedComments });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      likeComment: async (id) => {
        try {
          const { comments } = get();
          const updatedComments = { ...comments };
          
          Object.keys(updatedComments).forEach(postId => {
            updatedComments[postId] = updatedComments[postId].map(comment =>
              comment.id === id 
                ? { ...comment, likes: comment.likes + 1, isLiked: true }
                : comment
            );
          });
          
          set({ comments: updatedComments });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      unlikeComment: async (id) => {
        try {
          const { comments } = get();
          const updatedComments = { ...comments };
          
          Object.keys(updatedComments).forEach(postId => {
            updatedComments[postId] = updatedComments[postId].map(comment =>
              comment.id === id 
                ? { ...comment, likes: Math.max(0, comment.likes - 1), isLiked: false }
                : comment
            );
          });
          
          set({ comments: updatedComments });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Challenges actions
      fetchChallenges: async () => {
        try {
          // Mock API call
          const mockChallenges: Challenge[] = [
            {
              id: '1',
              title: 'Thử thách 30 ngày uống đủ nước',
              description: 'Uống đủ 2L nước mỗi ngày trong 30 ngày',
              type: 'water',
              duration: 30,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              participants: 156,
              maxParticipants: 500,
              prize: 'Huy hiệu đặc biệt',
              rules: [
                'Uống ít nhất 2L nước mỗi ngày',
                'Ghi nhận hàng ngày trong ứng dụng',
                'Không được bỏ lỡ quá 3 ngày',
              ],
              isActive: true,
              isParticipating: false,
              createdBy: {
                id: 'admin',
                firstName: 'NutriScan',
                lastName: 'Team',
              },
              createdAt: new Date().toISOString(),
            },
          ];
          
          set({ challenges: mockChallenges });

        } catch (error) {
          console.error('Failed to fetch challenges:', error);
        }
      },

      fetchActiveChallenges: async () => {
        try {
          const { challenges } = get();
          const activeChallenges = challenges.filter(c => c.isActive);
          set({ activeChallenges });

        } catch (error) {
          console.error('Failed to fetch active challenges:', error);
        }
      },

      fetchUserChallenges: async () => {
        try {
          const { challenges } = get();
          const userChallenges = challenges.filter(c => c.isParticipating);
          set({ userChallenges });

        } catch (error) {
          console.error('Failed to fetch user challenges:', error);
        }
      },

      joinChallenge: async (id) => {
        try {
          const { challenges } = get();
          const updatedChallenges = challenges.map(challenge =>
            challenge.id === id 
              ? { 
                  ...challenge, 
                  isParticipating: true, 
                  participants: challenge.participants + 1,
                  progress: { current: 0, target: challenge.duration, rank: 0 }
                }
              : challenge
          );
          
          set({ challenges: updatedChallenges });

          // Track analytics
          AnalyticsService.trackChallengeParticipation(id, challenges.find(c => c.id === id)?.type || 'unknown');

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      leaveChallenge: async (id) => {
        try {
          const { challenges } = get();
          const updatedChallenges = challenges.map(challenge =>
            challenge.id === id 
              ? { 
                  ...challenge, 
                  isParticipating: false, 
                  participants: Math.max(0, challenge.participants - 1),
                  progress: undefined,
                }
              : challenge
          );
          
          set({ challenges: updatedChallenges });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      updateChallengeProgress: async (id, progress) => {
        try {
          const { challenges } = get();
          const updatedChallenges = challenges.map(challenge =>
            challenge.id === id && challenge.progress
              ? { 
                  ...challenge, 
                  progress: { ...challenge.progress, current: progress }
                }
              : challenge
          );
          
          set({ challenges: updatedChallenges });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Leaderboards actions
      fetchWeeklyLeaderboard: async () => {
        try {
          // Mock API call
          const mockLeaderboard: Leaderboard = {
            period: 'weekly',
            entries: [
              {
                rank: 1,
                userId: 'user1',
                user: {
                  id: 'user1',
                  firstName: 'Nguyễn',
                  lastName: 'Văn A',
                  avatar: 'https://example.com/avatar1.jpg',
                },
                score: 950,
                change: 2,
                achievements: 12,
                streakDays: 15,
              },
            ],
            userRank: 25,
            totalParticipants: 1250,
            lastUpdated: new Date().toISOString(),
          };
          
          set({ weeklyLeaderboard: mockLeaderboard });

        } catch (error) {
          console.error('Failed to fetch weekly leaderboard:', error);
        }
      },

      fetchMonthlyLeaderboard: async () => {
        try {
          // Mock API call - similar to weekly
          const mockLeaderboard: Leaderboard = {
            period: 'monthly',
            entries: [],
            totalParticipants: 5000,
            lastUpdated: new Date().toISOString(),
          };
          
          set({ monthlyLeaderboard: mockLeaderboard });

        } catch (error) {
          console.error('Failed to fetch monthly leaderboard:', error);
        }
      },

      fetchAllTimeLeaderboard: async () => {
        try {
          // Mock API call - similar to weekly
          const mockLeaderboard: Leaderboard = {
            period: 'allTime',
            entries: [],
            totalParticipants: 25000,
            lastUpdated: new Date().toISOString(),
          };
          
          set({ allTimeLeaderboard: mockLeaderboard });

        } catch (error) {
          console.error('Failed to fetch all-time leaderboard:', error);
        }
      },

      // Social actions
      fetchFollowing: async () => {
        try {
          // Mock API call
          const mockFollowing = [];
          set({ following: mockFollowing });

        } catch (error) {
          console.error('Failed to fetch following:', error);
        }
      },

      fetchFollowers: async () => {
        try {
          // Mock API call
          const mockFollowers = [];
          set({ followers: mockFollowers });

        } catch (error) {
          console.error('Failed to fetch followers:', error);
        }
      },

      followUser: async (userId) => {
        try {
          // Track analytics
          AnalyticsService.trackEvent('user_followed', { followed_user_id: userId });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      unfollowUser: async (userId) => {
        try {
          // Track analytics
          AnalyticsService.trackEvent('user_unfollowed', { unfollowed_user_id: userId });

        } catch (error) {
          const appError = ErrorHandler.handleApiError(error);
          set({ error: appError });
          throw appError;
        }
      },

      // Utility actions
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      syncData: async () => {
        try {
          set({ isLoading: true });
          
          // Sync all community data
          await Promise.all([
            get().fetchPosts(),
            get().fetchChallenges(),
            get().fetchWeeklyLeaderboard(),
            get().fetchFollowing(),
            get().fetchFollowers(),
          ]);

          set({ 
            isLoading: false,
            lastSyncDate: new Date().toISOString(),
          });

        } catch (error) {
          console.error('Failed to sync community data:', error);
          set({ isLoading: false });
        }
      },

      clearCommunityData: () => {
        set({
          posts: [],
          userPosts: [],
          bookmarkedPosts: [],
          comments: {},
          challenges: [],
          activeChallenges: [],
          userChallenges: [],
          weeklyLeaderboard: null,
          monthlyLeaderboard: null,
          allTimeLeaderboard: null,
          following: [],
          followers: [],
          isLoading: false,
          error: null,
          lastSyncDate: null,
        });
      },
    }),
    {
      name: 'community-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bookmarkedPosts: state.bookmarkedPosts,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
);

export default useCommunityStore;