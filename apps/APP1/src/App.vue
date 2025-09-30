<script setup>
import { onMounted, ref } from 'vue'
import api from './api'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const users = ref([])
const apiResponse = ref('')

// 模拟登录和数据获取
onMounted(async () => {
  try {
    // 1. 模拟登录
    const loginData = await api.auth.login({ username: 'admin', password: 'password' })
    authStore.setToken(loginData.token)
    apiResponse.value += 'Login successful. Token received.\n'

    // 2. 获取用户信息
    const profile = await api.auth.getProfile()
    authStore.setProfile(profile)
    apiResponse.value += `Profile received: ${profile.username}. Permissions: ${profile.permissions.join(', ')}\n`

    // 3. 获取用户列表
    const userList = await api.user.getList()
    users.value = userList
    apiResponse.value += `User list received: ${userList.length} users.\n`
  }
  catch (error) {
    console.error('Verification failed:', error)
    apiResponse.value = `An error occurred: ${error.message || 'Unknown error'}`
  }
})
</script>

<template>
  <main>
    <h1>TRS Project - Verification</h1>
    <div class="card">
      <h2>API & Auth Store Status</h2>
      <p>Welcome, <strong>{{ authStore.username || 'Guest' }}</strong></p>
      <p>Authenticated: <strong>{{ authStore.isAuthenticated }}</strong></p>
      <p>Permissions: <code>{{ authStore.permissions.join(', ') }}</code></p>
      <hr>
      <h3>API Call Log:</h3>
      <pre>{{ apiResponse }}</pre>
    </div>

    <div class="card">
      <h2>Permission Directive (v-permission) Test</h2>
      <p>The user has a wildcard permission <code>*</code>, so all buttons below should be visible.</p>
      <button v-permission="'btn:user:create'">
        Create User (requires 'btn:user:create')
      </button>
      <button v-permission="'btn:user:delete'">
        Delete User (requires 'btn:user:delete')
      </button>
      <button v-permission="'page:dashboard:view'">
        View Dashboard (requires 'page:dashboard:view')
      </button>
    </div>

    <div class="card">
      <h2>User List from API</h2>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.username }} ({{ user.email }})
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
main {
  font-family: sans-serif;
  padding: 1rem;
}
.card {
  background-color: #2b2b2b;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
h1, h2 {
  margin-top: 0;
}
hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 1rem 0;
}
pre {
  background-color: #202020;
  padding: 1rem;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #e9e9e9;
}
</style>
