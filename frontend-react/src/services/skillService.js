import apiClient from './apiClient';

/**
 * Skill Service
 * Replaces Angular's SkillService
 * Handles skill-related API calls
 */
export const skillService = {
  /**
   * Get all skills
   */
  async getAllSkills(filters = {}) {
    return apiClient.get('/skills', { params: filters });
  },

  /**
   * Search skills
   */
  async searchSkills(query) {
    return apiClient.get('/skills/search', {
      params: { q: query },
    });
  },

  /**
   * Get skill details
   */
  async getSkill(skillId) {
    return apiClient.get(`/skills/${skillId}`);
  },

  /**
   * Create new skill
   */
  async createSkill(skillData) {
    return apiClient.post('/skills', skillData);
  },

  /**
   * Update skill
   */
  async updateSkill(skillId, data) {
    return apiClient.put(`/skills/${skillId}`, data);
  },

  /**
   * Delete skill
   */
  async deleteSkill(skillId) {
    return apiClient.delete(`/skills/${skillId}`);
  },

  /**
   * Get skill reviews
   */
  async getSkillReviews(skillId) {
    return apiClient.get(`/skills/${skillId}/reviews`);
  },
};
