import { create } from 'zustand';
import { Post, Comment, LeaderboardEntry } from '@types';
import communityApi from '@services/api/communityApi';

interface CommunityState {
  posts: Post[];
  leaderboard: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadFeed: (refresh?: boolean) => Promise<void>;
  createPost: (content: string, imageUrl?: string, postType?: string) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  loadLeaderboard: (period?: 'weekly' | 'monthly' | 'all_time') => Promise<void>;
  clearError: () => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  leaderboard: [],
  userRank: null,
  isLoading: false,
  error: null,

  loadFeed: async (refresh = false) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await communityApi.getFeed({ limit: 20, offset: 0 });
      
      if (response.success && response.data) {
        set({
          posts: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.message || 'Failed to load feed',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load feed',
        isLoading: false,
      });
    }
  },

  createPost: async (content, imageUrl, postType) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await communityApi.createPost({
        content,
        imageUrl,
        postType: postType as any,
      });
      
      if (response.success && response.data) {
        set((state) => ({
          posts: [response.data!, ...state.posts],
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || 'Failed to create post',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create post',
        isLoading: false,
      });
      return false;
    }
  },

  toggleLike: async (postId) => {
    try {
      const response = await communityApi.toggleLike(postId);
      
      if (response.success && response.data) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: response.data!.isLiked,
                  likesCount: response.data!.isLiked
                    ? post.likesCount + 1
                    : post.likesCount - 1,
                }
              : post
          ),
        }));
      }
    } catch (error) {
      console.error('Toggle like error:', error);
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await communityApi.addComment(postId, content);
      
      if (response.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, commentsCount: post.commentsCount + 1 }
              : post
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add comment error:', error);
      return false;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await communityApi.deletePost(postId);
      
      if (response.success) {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== postId),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete post error:', error);
      return false;
    }
  },

  loadLeaderboard: async (period = 'weekly') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await communityApi.getLeaderboard(period);
      
      if (response.success && response.data) {
        set({
          leaderboard: response.data.leaderboard,
          userRank: response.data.userRank,
          isLoading: false,
        });
      } else {
        set({
          error: response.message || 'Failed to load leaderboard',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load leaderboard',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCommunityStore;
