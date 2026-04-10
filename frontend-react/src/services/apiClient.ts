import axios from 'axios';
import { tokenHandler } from '../utils/tokenHandler';

/**
 * SkillSync Standard API Client
 * Reverted to strict JWT-only authorization (No shadow headers or query-params).
 * This respects the backend's internal RBAC (Role-Based Access Control).
 */
const apiClient = axios.create({
  baseURL: 'https://api.20.244.84.62.nip.io/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenHandler.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Return data directly for cleaner consumption
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    
    // Standard Unauthorized Redirect
    if (status === 401) {
      tokenHandler.removeToken();
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    } 

    // Graceful 403 Logging (Task 6)
    if (status === 403) {
      console.warn(`[SkillSync] Authenticated as Learner. Path blocked: ${error.config.url}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
