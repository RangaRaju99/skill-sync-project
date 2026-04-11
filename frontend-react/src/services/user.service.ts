import apiClient from './apiClient';

export const userService = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/user/profile');
    const data = response.data || response;
    return { ...response, data: mapProfile(data) };
  },

  getProfile: async (userId: number) => {
    const response = await apiClient.get(`/user/profile/${userId}`);
    const data = response.data || response;
    return { ...response, data: mapProfile(data) };
  },

  updateProfile: async (req: any) => {
    const response = await apiClient.put('/user/profile', req);
    const data = response.data || response;
    return { ...response, data: mapProfile(data) };
  }
};

function mapProfile(p: any): any {
  if (!p) return p;
  if (p.name && !p.firstName) {
    const parts = (p.name || '').trim().split(' ');
    p.firstName = parts[0];
    p.lastName = parts.slice(1).join(' ');
  }
  return p;
}
