import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://api.20.244.84.62.nip.io/api';

/**
 * Chat Service handles REST operations for messages and file uploads.
 */
export const chatService = {
  /**
   * Fetch paginated messages for a group.
   */
  getMessages: async (groupId: number, page = 0, size = 20) => {
    const response = await axios.get(`${API_URL}/chat/messages/${groupId}?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'X-Gateway-Request': 'true'
      }
    });
    return response.data;
  },

  /**
   * Get pinned messages for a group.
   */
  getPinnedMessages: async (groupId: number) => {
    const response = await axios.get(`${API_URL}/chat/messages/${groupId}/pinned`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'X-Gateway-Request': 'true'
      }
    });
    return response.data;
  },

  /**
   * Upload a file and get the message object.
   */
  uploadFile: async (file: File, groupId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('groupId', groupId.toString());

    const response = await axios.post(`${API_URL}/chat/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'X-Gateway-Request': 'true',
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Pin or unpin a message.
   */
  togglePin: async (messageId: number) => {
    const response = await axios.put(`${API_URL}/chat/messages/${messageId}/pin`, {}, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'X-Gateway-Request': 'true'
      }
    });
    return response.data;
  },

  /**
   * Delete a message (admin action).
   */
  deleteMessage: async (messageId: number) => {
    const response = await axios.delete(`${API_URL}/chat/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'X-Gateway-Request': 'true'
      }
    });
    return response.data;
  }
};
