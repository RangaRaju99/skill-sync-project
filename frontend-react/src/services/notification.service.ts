import apiClient from './apiClient';

export const notificationService = {
  getAll: async () => {
    return await apiClient.get('/notification');
  },

  getUnread: async () => {
    return await apiClient.get('/notification/unread');
  },

  getUnreadCount: async () => {
    return await apiClient.get('/notification/unread/count');
  },

  markAsRead: async (id: number) => {
    return await apiClient.put(`/notification/${id}/read`);
  },

  delete: async (id: number) => {
    return await apiClient.delete(`/notification/${id}`);
  }
};
