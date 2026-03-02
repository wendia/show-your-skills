import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  stats: {
    wins: number;
    losses: number;
    draws: number;
    rating: number;
  };
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error?.message || 'Login failed');
          }

          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error?.message || 'Registration failed');
          }

          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        const { token } = get();
        
        if (token) {
          fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(console.error);
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });

        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          set({
            user: data.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
