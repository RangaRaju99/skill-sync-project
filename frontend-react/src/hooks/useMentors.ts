import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface MentorFilters {
  skill?: string;
  minExperience?: number | null;
  maxExperience?: number | null;
  maxRate?: number | null;
  minRating?: number | null;
}

export interface MentorDto {
  id: number;
  userId: number;
  specialization: string;
  yearsOfExperience: number;
  hourlyRate: number;
  bio?: string;
  isApproved?: boolean;
  status?: string;
  availabilityStatus?: string;
  createdAt: string;
}

export const useMentor = (id: number) => {
  return useQuery({
    queryKey: ['mentor', id],
    queryFn: async () => {
      const response: any = await apiClient.get(`/mentor/${id}`);
      const m = response?.data ?? response;
      if (!m || !m.userId) return null;

      try {
        const userRes: any = await apiClient.get(`/user/profile/${m.userId}`);
        const userProfile = userRes?.data ?? userRes;
        return {
          ...m,
          name: userProfile?.name || userProfile?.username || `Mentor ${m.userId}`,
          avatar: userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username || m.userId}`,
        } as MentorDto & { name: string; avatar: string };
      } catch (e) {
        return {
          ...m,
          name: `Mentor ${m.userId}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId}`,
        } as MentorDto & { name: string; avatar: string };
      }
    },
    enabled: !!id,
  });
};

export const useMyMentorProfile = () => {
  return useQuery({
    queryKey: ['mentor', 'me'],
    queryFn: async () => {
      try {
        // apiClient interceptor returns `response.data` (the ApiResponse wrapper object)
        // ApiResponse structure: { success, data: MentorDto, message, statusCode }
        // So the actual mentor object is at `response.data` (response = ApiResponse)
        const response: any = await apiClient.get('/mentor/profile/me');
        const mentorData = response?.data ?? response;
        if (!mentorData || !mentorData.id) return null;
        return {
          ...mentorData,
          // Normalize: backend may set `isApproved:true` or `status:'APPROVED'`
          isApproved: mentorData.isApproved === true || mentorData.status === 'APPROVED',
        };
      } catch (e: any) {
        // 404 = no profile, 403 = not a mentor yet — both are expected
        if (e.response?.status === 404 || e.response?.status === 403) return null;
        throw e;
      }
    },
    retry: false,
    staleTime: 30_000,
  });
};

export const useApplyMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: { specialization: string; yearsOfExperience: number; hourlyRate: number; bio: string; }) => {
      const response: any = await apiClient.post('/mentor/apply', req);
      return response?.data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    }
  });
};

export const useMentors = (filters: MentorFilters = {}) => {
  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: async () => {
      const hasFilter = (filters.skill && filters.skill.length >= 2) ||
        filters.minExperience != null ||
        filters.maxExperience != null ||
        filters.maxRate != null ||
        filters.minRating != null;

      const unpack = (r: any) => {
        if (!r) return [];
        if (Array.isArray(r)) return r;
        if (Array.isArray(r.data)) return r.data;
        if (r.data && Array.isArray(r.data.data)) return r.data.data;
        return [];
      };

      let mentorsRaw: any[] = [];
      if (hasFilter) {
        const response: any = await apiClient.post('/mentor/search', filters);
        mentorsRaw = unpack(response);
      } else {
        const response: any = await apiClient.get('/mentor/approved');
        mentorsRaw = unpack(response);
      }

      if (!Array.isArray(mentorsRaw) || mentorsRaw.length === 0) {
        // Double check: some implementations return the wrapper in response.data.data
        console.warn('[SkillSync] Mentors list scavenge results:', mentorsRaw);
      }

      // Enrich with user profiles
      const enriched = await Promise.all(
        mentorsRaw.map(async (m: any) => {
          try {
            const userRes: any = await apiClient.get(`/user/profile/${m.userId}`);
            const userProfile = userRes?.data ?? userRes;
            return {
              ...m,
              name: userProfile?.name || userProfile?.username || `Mentor ${m.userId}`,
              avatar: userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username || m.userId}`,
            };
          } catch (e) {
            return {
              ...m,
              name: `Mentor ${m.userId}`,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId}`,
            };
          }
        })
      );
      return enriched;
    },
  });
};
