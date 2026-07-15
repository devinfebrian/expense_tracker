import { create } from 'zustand';
import api from '../api/axios.js';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({ user: res.data.data.user });
    return res.data.data.user;
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    set({ user: res.data.data.user });
    return res.data.data.user;
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
  },

  updateProfile: async (name, email) => {
    const res = await api.put('/auth/profile', { name, email });
    set({ user: res.data.data.user });
    return res.data.data.user;
  },

  updatePassword: async (currentPassword, newPassword) => {
    await api.put('/auth/password', { currentPassword, newPassword });
  }
}));
