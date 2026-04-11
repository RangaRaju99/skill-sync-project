import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface SkillDto {
  id: number;
  skillName: string;
  category: string;
  description: string;
  popularityScore?: number;
  isActive?: boolean;
}

export interface CreateSkillRequest {
  skillName: string;
  category?: string;
  description?: string;
}

const getAllSkills = async (): Promise<SkillDto[]> => {
  const response: any = await apiClient.get('/skill');
  return response.data || [];
};

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills,
  });
}

export function groupSkillsByCategory(skills: SkillDto[]) {
  const map = new Map<string, { id: number; name: string }[]>();
  for (const s of skills) {
    const cat = s.category?.trim() || 'Other';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push({ id: s.id, name: s.skillName });
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, skills]) => ({ 
      category, 
      skills: skills.sort((a, b) => a.name.localeCompare(b.name)) 
    }));
}
