import apiClient from './apiClient';
import { ChatMessage, ApiResponse } from '@types';

export const chatApi = {
  /**
   * Send message to AI chatbot
   */
  sendMessage: async (
    message: string
  ): Promise<ApiResponse<{
    message: ChatMessage;
    response: string;
    suggestions: string[];
  }>> => {
    return await apiClient.post('/chat/message', { message });
  },

  /**
   * Get chat history
   */
  getChatHistory: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ChatMessage[]>> => {
    return await apiClient.get('/chat/history', { params });
  },

  /**
   * Clear chat history
   */
  clearChatHistory: async (): Promise<ApiResponse> => {
    return await apiClient.delete('/chat/history');
  },
};

export default chatApi;
