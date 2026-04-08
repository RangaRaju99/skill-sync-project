import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

import type { CreateSkillRequest } from './useSkills';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const pendingMentorsQuery = useQuery({
    queryKey: ['admin', 'pending-mentors'],
    queryFn: async () => {
      const response: any = await apiClient.get('/mentor/pending');
      return response.data || [];
    }
  });

  const approveMentorMutation = useMutation({
    mutationFn: (id: number) => apiClient.put(`/mentor/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-mentors'] });
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    }
  });

  const rejectMentorMutation = useMutation({
    mutationFn: (id: number) => apiClient.put(`/mentor/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pending-mentors'] }),
  });

  const createSkillMutation = useMutation({
    mutationFn: (skill: CreateSkillRequest) => apiClient.post('/skill', skill),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, skill }: { id: number; skill: CreateSkillRequest }) => apiClient.put(`/skill/${id}`, skill),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/skill/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });

  return {
    pendingMentors: pendingMentorsQuery.data || [],
    isPendingMentorsLoading: pendingMentorsQuery.isLoading,
    approveMentor: approveMentorMutation.mutateAsync,
    rejectMentor: rejectMentorMutation.mutateAsync,
    createSkill: createSkillMutation.mutateAsync,
    updateSkill: updateSkillMutation.mutateAsync,
    deleteSkill: deleteSkillMutation.mutateAsync,
    isSkillSaving: createSkillMutation.isPending || updateSkillMutation.isPending
  };
};
