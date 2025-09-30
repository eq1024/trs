import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PermissionString } from '@trs/permission';

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string | null>(localStorage.getItem('authToken'));
  const permissions = ref<PermissionString[]>([]);
  const username = ref<string>('');

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value);

  // --- Actions ---
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('authToken', newToken);
  }

  function clearToken() {
    token.value = null;
    permissions.value = [];
    username.value = '';
    localStorage.removeItem('authToken');
  }

  function setProfile(profile: { username: string; permissions: PermissionString[] }) {
    username.value = profile.username;
    permissions.value = profile.permissions || [];
  }

  return {
    token,
    permissions,
    username,
    isAuthenticated,
    setToken,
    clearToken,
    setProfile,
  };
});