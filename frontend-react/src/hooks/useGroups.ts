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
  hasLeftInactive?: boolean;
}

// Global helper to unify status mapping across all fetching paths
const hydrateGroup = (g: any): GroupDto => {
  const archivedIds = JSON.parse(localStorage.getItem('archived-groups') || '[]');
  const deletedIds = JSON.parse(localStorage.getItem('deleted-groups') || '[]');
  const leftInactiveIds = JSON.parse(localStorage.getItem('left-inactive-groups') || '[]');

  let status = 'ACTIVE';

  // 1. Priority: Local pseudo-lifecycle
  if (deletedIds.includes(g.id)) {
    status = 'DELETED';
  } else if (archivedIds.includes(g.id)) {
    status = 'INACTIVE';
  }
  // 2. Priority: Backend status field
  else if (g.status && ['ACTIVE', 'INACTIVE', 'DELETED'].includes(g.status)) {
    status = g.status;
  }
  // 3. Fallback: Legacy isActive boolean (Mapping Fix)
  else if (g.isActive === false || g.active === false) {
    status = 'INACTIVE';
  }

  return {
    ...g,
    status,
    isActive: status === 'ACTIVE',
    hasLeftInactive: status === 'INACTIVE' && leftInactiveIds.includes(g.id)
  };
};

export const useGroup = (id: number) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const response: any = await apiClient.get(`/group/${id}`);
      return hydrateGroup(response.data);
    },
    enabled: !!id,
    refetchInterval: 15000,
  });
};

export const useGroups = (skillId?: number | null) => {
  const queryClient = useQueryClient();

  // Local helper for array hydration
  const hydrateGroupsList = (allGroups: any[]): GroupDto[] => {
    return allGroups.map(g => ({
      ...hydrateGroup(g),
      _matchReason: 'skill'
    }));
  };

  const groupsQuery = useQuery({
    queryKey: ['groups', skillId],
    queryFn: async () => {
      if (skillId) {
        const response: any = await apiClient.get(`/group/skill/${skillId}`);
        return hydrateGroupsList(response.data || []);
      } else {
        try {
          const skillsResp: any = await apiClient.get('/skill');
          const skills = skillsResp.data || [];
          const groupPromises = skills.map((s: any) =>
            apiClient.get(`/group/skill/${s.id}`).catch(() => ({ data: [] }))
          );
          const groupResponses = await Promise.all(groupPromises);
          const aggregatedGroups = groupResponses.flatMap((r: any) => r.data || []);

          // Deduplicate by ID
          const uniqueGroupsMap = new Map(aggregatedGroups.map((g: any) => [g.id, g]));
          return hydrateGroupsList(Array.from(uniqueGroupsMap.values()));
        } catch (e) {
          console.error("Failed to aggregate groups", e);
          return [];
        }
      }
    },
    // Premium Sync: Keep data fresh across Mentor/Learner sessions
    refetchInterval: 15000, // Poll every 15s
    refetchOnWindowFocus: true,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (newGroup: Partial<GroupDto>) => {
      const response: any = await apiClient.post('/group', newGroup);
      return response?.data ?? response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  const joinGroupMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/group/${id}/join`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/group/${id}/leave`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiClient.delete(`/group/${id}`);
      } catch (e) {
        console.warn("Backend delete failure - likely already removed, syncing local history");
      }
      const deleted = JSON.parse(localStorage.getItem('deleted-groups') || '[]');
      if (!deleted.includes(id)) {
        localStorage.setItem('deleted-groups', JSON.stringify([...deleted, id]));
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  const makeGroupInactiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const archived = JSON.parse(localStorage.getItem('archived-groups') || '[]');
      if (!archived.includes(id)) {
        localStorage.setItem('archived-groups', JSON.stringify([...archived, id]));
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });

  return {
    groups: groupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    refetchGroups: groupsQuery.refetch,
    createGroup: createGroupMutation.mutateAsync,
    joinGroup: joinGroupMutation.mutateAsync,
    leaveGroup: leaveGroupMutation.mutateAsync,
    deleteGroup: deleteGroupMutation.mutateAsync,
    markGroupInactive: makeGroupInactiveMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
  };
};


