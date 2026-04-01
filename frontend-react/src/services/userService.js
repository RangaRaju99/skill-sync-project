import apiClient from './apiClient';

/**
 * User Service
 * Replaces Angular's UserService
 * Handles user-related API calls
 */
export const userService = {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    return apiClient.put(`/users/${userId}`, data);
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/users/${userId}/picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Get user skills
   */
  async getUserSkills(userId) {
    return apiClient.get(`/users/${userId}/skills`);
  },

  /**
   * Add skill to user
   */
  async addSkill(userId, skillData) {
    return apiClient.post(`/users/${userId}/skills`, skillData);
  },

  /**
   * Remove skill from user
   */
  async removeSkill(userId, skillId) {
    return apiClient.delete(`/users/${userId}/skills/${skillId}`);
  },

  /**
   * Get user mentoring sessions
   */
  async getMentoringSessions(userId) {
    return apiClient.get(`/users/${userId}/sessions`);
  },
};
