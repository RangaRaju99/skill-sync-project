import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserSummary } from '../../types';

type UserRole = 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN' | null;

interface AuthState {
  user: UserSummary | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: UserRole;
}

const getStoredAuth = () => {
  try {
    const user = localStorage.getItem('ss_user');
    const accessToken = localStorage.getItem('ss_access_token');
    const refreshToken = localStorage.getItem('ss_refresh_token');
    
    if (user && accessToken) {
      return {
        user: JSON.parse(user),
        accessToken,
        refreshToken,
        isAuthenticated: true,
        role: (JSON.parse(user) as UserSummary).role as UserRole,
      };
    }
  } catch (e) {
    console.error('Failed to load auth from localStorage', e);
  }
  return null;
};

const initialState: AuthState = getStoredAuth() || {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  role: null,
};

interface SetCredentialsPayload {
  user: UserSummary | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      const { user, accessToken, refreshToken } = action.payload;
      
      if (user) {
        state.user = user;
        state.role = user.role as UserRole;
        state.isAuthenticated = true;
        localStorage.setItem('ss_user', JSON.stringify(user));
      }

      if (accessToken) {
        state.accessToken = accessToken;
        localStorage.setItem('ss_access_token', accessToken);
      }

      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem('ss_refresh_token', refreshToken);
      }
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.role = null;

      localStorage.removeItem('ss_user');
      localStorage.removeItem('ss_access_token');
      localStorage.removeItem('ss_refresh_token');
    },
    updateUserName(state, action: PayloadAction<{ firstName: string; lastName: string }>) {
      if (!state.user) {
        return;
      }

      state.user = {
        ...state.user,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
      };
    },
  },
});

export const { setCredentials, logout, updateUserName } = authSlice.actions;
export default authSlice.reducer;
