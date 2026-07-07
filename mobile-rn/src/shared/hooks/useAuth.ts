import { create } from 'zustand';
import {
  isAuthenticated,
  getUserId,
  getUserEmail,
  isEmailVerified,
  signOut as authSignOut,
} from '../../core/auth/authService';

interface AuthState {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  emailVerified: boolean;
  loading: boolean;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  setEmailVerified: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authenticated: false,
  userId: null,
  email: null,
  emailVerified: false,
  loading: true,

  checkAuth: async () => {
    const auth = await isAuthenticated();
    if (auth) {
      const [userId, email, verified] = await Promise.all([
        getUserId(),
        getUserEmail(),
        isEmailVerified(),
      ]);
      set({ authenticated: true, userId, email, emailVerified: verified, loading: false });
    } else {
      set({ authenticated: false, userId: null, email: null, emailVerified: false, loading: false });
    }
  },

  signOut: async () => {
    await authSignOut();
    set({ authenticated: false, userId: null, email: null, emailVerified: false });
  },

  setEmailVerified: (value: boolean) => set({ emailVerified: value }),
}));
