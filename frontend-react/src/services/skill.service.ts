import apiClient from './apiClient';

export interface Skill {
  id: number;
  skillName: string;
  category?: string;
  description?: string;
  isActive: boolean;
}

export const skillService = {
  getAllSkills: async () => {
    const response: any = await apiClient.get('/skill');
    // The SkillController returns ApiResponse<List<SkillResponseDto>>
    // apiClient interceptor returns response.data
    return response.data || [];
  },

  searchSkills: async (keyword: string) => {
    const response: any = await apiClient.get(`/skill/search?keyword=${keyword}`);
    return response.data || [];
  }
};
