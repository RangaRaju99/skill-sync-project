import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  roles: string[];
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  addRole: (role: string) => void;
  logout: () => void;
}

// ─── Read persisted user from localStorage (like Angular AuthStore does) ───
// This ensures roles are immediately available on page refresh WITHOUT waiting
// for the async checkAuth() → userService.getCurrentUser() round-trip.
const getPersistedUser = (): User | null => {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('ss_userId');
    if (!token || !userId) return null;
    const roles: string[] = JSON.parse(localStorage.getItem('ss_roles') ?? '[]');
    return {
      id: userId,
      name: localStorage.getItem('ss_name') || '',
      email: localStorage.getItem('ss_email') || '',
      username: localStorage.getItem('ss_username') || undefined,
      roles,
    };
  } catch {
    return null;
  }
};

const persistUser = (user: User, token: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('ss_userId', String(user.id));
  localStorage.setItem('ss_name', user.name || '');
  localStorage.setItem('ss_email', user.email || '');
  localStorage.setItem('ss_username', user.username || '');
  localStorage.setItem('ss_roles', JSON.stringify(user.roles));
};

const clearPersistedUser = () => {
  localStorage.removeItem('token');
  ['ss_userId', 'ss_name', 'ss_email', 'ss_username', 'ss_roles'].forEach(k =>
    localStorage.removeItem(k)
  );
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getPersistedUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    persistUser(user, token);
    set({ user, token, isAuthenticated: true });
  },

  addRole: (role) =>
    set((state) => {
      if (!state.user) return {};
      if (state.user.roles.includes(role)) return {};
      const roles = [...state.user.roles, role];
      const updatedUser = { ...state.user, roles };
      localStorage.setItem('ss_roles', JSON.stringify(roles));
      return { user: updatedUser };
    }),

  logout: () => {
    clearPersistedUser();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
