import apiClient from './apiClient';

export const authService = {
  login: async (credentials: any) => {
    return await apiClient.post('/auth/login', credentials);
  },
  register: async (userData: any) => {
    return await apiClient.post('/auth/register', userData);
  },
  sendOtp: async (email: string) => {
    return await apiClient.post('/auth/send-otp', { email });
  },
  verifyOtp: async (payload: { email: string; otp: string }) => {
    return await apiClient.post('/auth/verify-otp', payload);
  },
  sendForgotPasswordOtp: async (email: string) => {
    return await apiClient.post('/auth/forgot-password', { email });
  },
  verifyForgotPasswordOtp: async (email: string, otp: string) => {
    return await apiClient.post('/auth/verify-forgot-password-otp', { email, otp });
  },
  resetPassword: async (email: string, newPassword: string) => {
    return await apiClient.post('/auth/reset-password', { email, newPassword });
  },
  // Calls POST /auth/refresh — backend re-reads roles from DB and issues a new JWT
  // This is needed when a user is approved as a mentor AFTER they logged in
  refreshToken: async () => {
    return await apiClient.post('/auth/refresh', {});
  }
};
