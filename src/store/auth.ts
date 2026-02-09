'use client';

import { create } from 'zustand';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<'STUDENT' | 'TEACHER'>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role?: 'STUDENT' | 'TEACHER';
    classCode?: string;
    className?: string;
  }) => Promise<'STUDENT' | 'TEACHER'>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('token', response.accessToken);
    set({
      user: response.user,
      token: response.accessToken,
      isAuthenticated: true,
    });
    return response.user.role;
  },

  register: async (data) => {
    const response = await authApi.register(data);
    localStorage.setItem('token', response.accessToken);
    set({
      user: response.user,
      token: response.accessToken,
      isAuthenticated: true,
    });
    return response.user.role;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await authApi.getProfile();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

