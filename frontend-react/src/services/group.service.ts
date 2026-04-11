import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://api.20.244.84.62.nip.io/api';

/**
 * Group Service handles operations related to learning groups.
 */
export const groupService = {
  /**
   * Fetch all groups the current user is a member of.
   */
  getMyGroups: async () => {
    const response = await axios.get(`${API_URL}/group/my-groups`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'X-Gateway-Request': 'true'
      }
    });
    // In our project, response data is wrapped in ApiResponse { success, data, message, statusCode }
    return response.data.data;
  },

  /**
   * Get specific group details.
   */
  getGroupDetails: async (groupId: number) => {
    const response = await axios.get(`${API_URL}/group/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'X-Gateway-Request': 'true'
      }
    });
    return response.data.data;
  }
};
