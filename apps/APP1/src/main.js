import { setupPermissionDirective } from '@trs/permission'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

import { useAuthStore } from './stores/auth'
import './assets/main.css'

const app = createApp(App)

// 1. Install Pinia
app.use(createPinia())

// 2. Install permission directive
// We need to provide the getAuthStore function to the directive setup
setupPermissionDirective(app, {
  getAuthStore: () => useAuthStore(),
})

app.mount('#app')
