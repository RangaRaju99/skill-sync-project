import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

export interface UserProfileDto {
  userId: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  bio?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  skills?: string;
  role?: string;
  createdAt?: string;
}

export const useProfile = (userId?: string) => {
  const { user: currentUser, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const id = userId || currentUser?.id;

  const profileQuery = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/user/profile/${id}`);
      return data.data as UserProfileDto;
    },
    enabled: !!id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (update: Partial<UserProfileDto>) => apiClient.put('/user/profile', update),
    onSuccess: (res) => {
      const updated = res.data.data;
      queryClient.setQueryData(['profile', id], updated);
      // If updating own profile, also update authStore
      if (!userId || userId === currentUser?.id) {
        setAuth({
          ...currentUser!,
          name: updated.name || currentUser!.name,
          username: updated.username || currentUser!.username,
          avatar: updated.profileImageUrl || currentUser!.avatar,
        }, localStorage.getItem('token')!);
      }
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
};
