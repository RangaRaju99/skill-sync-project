import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface GroupDto {
  id: number;
  name: string;
  description?: string;
  skillId: number;
  maxMembers: number;
  currentMembers?: number;
  memberCount?: number;
  creatorId: number;
  createdAt: string;
  isActive?: boolean;
  status?: string;
}

// Global helper to unify status mapping across all fetching paths
const hydrateGroup = (g: any): GroupDto => {
  return {
    ...g,
    status: g.status || 'ACTIVE',
    isActive: g.status === 'ACTIVE',
    hasLeftInactive: g.isExited === true
  };
};

export const useGroup = (id: number, userId?: string) => {
  return useQuery({
    queryKey: ['group', id, userId],
    queryFn: async () => {
      const headers = userId ? { 'X-User-Id': userId } : {};
      const response: any = await apiClient.get(`/group/${id}`, { headers });
      return hydrateGroup(response.data);
    },
    enabled: !!id,
    refetchInterval: 15000,
  });
};

export const useGroups = (skillId?: number | null, userId?: string) => {
  const queryClient = useQueryClient();

  const hydrateGroupsList = (allGroups: any[]): GroupDto[] => {
    return allGroups.map(g => ({
      ...hydrateGroup(g),
      _matchReason: 'skill'
    }));
  };

  const groupsQuery = useQuery({
    queryKey: ['groups', skillId, userId],
    queryFn: async () => {
      const headers = userId ? { 'X-User-Id': userId } : {};
      if (skillId) {
        const response: any = await apiClient.get(`/group/skill/${skillId}`, { headers });
        return hydrateGroupsList(response.data || []);
      } else {
        try {
          const skillsResp: any = await apiClient.get('/skill');
          const skills = skillsResp.data || [];
          const groupPromises = skills.map((s: any) =>
            apiClient.get(`/group/skill/${s.id}`, { headers }).catch(() => ({ data: [] }))
          );
          const groupResponses = await Promise.all(groupPromises);
          const aggregatedGroups = groupResponses.flatMap((r: any) => r.data || []);

          const uniqueGroupsMap = new Map(aggregatedGroups.map((g: any) => [g.id, g]));
          return hydrateGroupsList(Array.from(uniqueGroupsMap.values()));
        } catch (e) {
          console.error("Failed to aggregate groups", e);
          return [];
        }
      }
    },
    refetchInterval: 15000,
  });

  const createGroupMutation = useMutation({
    mutationFn: (newGroup: Partial<GroupDto>) => apiClient.post('/group', newGroup),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  const joinGroupMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/group/${id}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/group/${id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiClient.post(`/group/${id}/status/${status}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/group/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) => 
      apiClient.delete(`/group/${groupId}/members/${memberId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group'] }),
  });

  return {
    groups: groupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    refetchGroups: groupsQuery.refetch,
    createGroup: createGroupMutation.mutateAsync,
    joinGroup: joinGroupMutation.mutateAsync,
    leaveGroup: leaveGroupMutation.mutateAsync,
    deleteGroup: deleteGroupMutation.mutateAsync,
    markGroupInactive: (id: number) => updateStatusMutation.mutateAsync({ id, status: 'ARCHIVED' }),
    reactivateGroup: (id: number) => updateStatusMutation.mutateAsync({ id, status: 'ACTIVE' }),
    removeMember: removeMemberMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
  };
};


