import apiClient from './apiClient';
import { Post, Comment, LeaderboardEntry, ApiResponse } from '@types';

export const communityApi = {
  /**
   * Get community feed
   */
  getFeed: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Post[]>> => {
    return await apiClient.get('/community/feed', { params });
  },

  /**
   * Create post
   */
  createPost: async (data: {
    content: string;
    imageUrl?: string;
    postType?: 'general' | 'meal' | 'progress' | 'achievement';
  }): Promise<ApiResponse<Post>> => {
    return await apiClient.post('/community/post', data);
  },

  /**
   * Toggle like on post
   */
  toggleLike: async (postId: string): Promise<ApiResponse<{ isLiked: boolean }>> => {
    return await apiClient.post(`/community/post/${postId}/like`);
  },

  /**
   * Add comment to post
   */
  addComment: async (
    postId: string,
    content: string
  ): Promise<ApiResponse<Comment>> => {
    return await apiClient.post(`/community/post/${postId}/comment`, { content });
  },

  /**
   * Get comments for post
   */
  getComments: async (postId: string): Promise<ApiResponse<Comment[]>> => {
    return await apiClient.get(`/community/post/${postId}/comments`);
  },

  /**
   * Delete post
   */
  deletePost: async (postId: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/community/post/${postId}`);
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async (
    period: 'weekly' | 'monthly' | 'all_time' = 'weekly'
  ): Promise<ApiResponse<{
    leaderboard: LeaderboardEntry[];
    userRank: LeaderboardEntry | null;
  }>> => {
    return await apiClient.get('/community/leaderboard', { params: { period } });
  },

  /**
   * Follow user
   */
  followUser: async (userId: string): Promise<ApiResponse> => {
    return await apiClient.post(`/community/follow/${userId}`);
  },

  /**
   * Unfollow user
   */
  unfollowUser: async (userId: string): Promise<ApiResponse> => {
    return await apiClient.delete(`/community/follow/${userId}`);
  },

  /**
   * Get user's followers
   */
  getFollowers: async (userId: string): Promise<ApiResponse<any[]>> => {
    return await apiClient.get(`/community/user/${userId}/followers`);
  },

  /**
   * Get user's following
   */
  getFollowing: async (userId: string): Promise<ApiResponse<any[]>> => {
    return await apiClient.get(`/community/user/${userId}/following`);
  },
};

export default communityApi;
