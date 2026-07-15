import { useAuthStore } from '../store/useAuthStore.js';

export function useAuth() {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const login = useAuthStore(state => state.login);
  const register = useAuthStore(state => state.register);
  const logout = useAuthStore(state => state.logout);
  const fetchMe = useAuthStore(state => state.fetchMe);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const updatePassword = useAuthStore(state => state.updatePassword);
  
  return { user, loading, login, register, logout, fetchMe, updateProfile, updatePassword };
}