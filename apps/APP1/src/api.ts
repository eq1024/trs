import { createHttpClient, createApi } from '@trs/fetch';
import { useAuthStore } from '@/stores/auth';
// import router from '@/router'; // router will be imported in main.js

// Define app-specific handlers
const handlers = {
  getToken: () => {
    // Pinia store must be used inside a component setup or action,
    // but here we are in a plain module. We get a fresh instance.
    const authStore = useAuthStore();
    return authStore.token;
  },
  clearToken: () => {
    const authStore = useAuthStore();
    authStore.clearToken();
  },
  showError: (message: string) => {
    // In a real app, you would use a UI library like Element Plus or a custom toast component.
    console.error(`[API Error] ${message}`);
    alert(`[API Error] ${message}`); // Simple alert for demonstration
  },
  redirectToLogin: () => {
    // This is tricky outside of a component context.
    // A better way is to handle this via a navigation guard in router/index.js
    // For now, we'll just log it. The actual redirection will be handled elsewhere.
    console.log('Redirecting to login page...');
    // A simple way to force redirection.
    window.location.href = '/login';
  },
};

// Create the axios instance for the APP1
const httpClient = createHttpClient({
  // In a real app, this would come from .env files
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/mock',
  handlers,
});

// Create the API client
const api = createApi(httpClient);

export default api;