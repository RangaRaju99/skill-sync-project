import apiClient from './apiClient';

/**
 * Auth Service
 * Replaces Angular's AuthService
 * Handles authentication API calls
 *
 * Angular version would use:
 * - HttpClient for HTTP requests
 * - RxJS Observables for async operations
 *
 * React version uses:
 * - Axios for HTTP requests
 * - Promises/async-await for async operations
 */
export const authService = {
  /**
   * Login user
   * Angular: return this.http.post<LoginResponse>('/auth/login', credentials);
   * React: Uses promises instead of observables
   */
  async login(email, password) {
    return apiClient.post('/auth/login', {
      email,
      password,
    });
  },

  /**
   * Register new user
   */
  async register(userData) {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * Verify token validity
   */
  async verifyToken(token) {
    return apiClient.post('/auth/verify', { token });
  },

  /**
   * Refresh auth token
   */
  async refreshToken() {
    return apiClient.post('/auth/refresh');
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return apiClient.get('/auth/user');
  },

  /**
   * Logout user
   */
  async logout() {
    return apiClient.post('/auth/logout');
  },
};
