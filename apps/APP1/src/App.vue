<script setup>
import { useI18n } from '@trs/i18n'
import { onMounted, ref } from 'vue'
import api from './api'
import { useAuthStore } from './stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const users = ref([])
const apiResponse = ref('')

// 模拟登录和数据获取
onMounted(async () => {
  try {
    // 1. 模拟登录
    const loginData = await api.auth.login({ username: 'admin', password: 'password' })
    authStore.setToken(loginData.token)
    apiResponse.value += `${t('demo.loginSuccess')}\n`

    // 2. 获取用户信息
    const profile = await api.auth.getProfile()
    authStore.setProfile(profile)
    apiResponse.value += `${t('demo.profileReceived', { username: profile.username, permissions: profile.permissions.join(', ') })}\n`

    // 3. 获取用户列表
    const userList = await api.user.getList()
    users.value = userList
    apiResponse.value += `${t('demo.userListReceived', { count: userList.length })}\n`
  }
  catch (error) {
    console.error('Verification failed:', error)
    apiResponse.value = t('demo.errorOccurred', { error: error.message || 'Unknown error' })
  }
})
</script>

<template>
  <main>
    <h1>{{ t('demo.title') }}</h1>

    <div class="card">
      <h2>I18n Demo</h2>
      <p>{{ t('demo.currentLanguage', { lang: locale }) }}</p>
      <button @click="locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'">
        {{ t('demo.switchLanguage') }}
      </button>
    </div>

    <div class="card">
      <h2>{{ t('demo.authStatus') }}</h2>
      <p>{{ t('demo.welcome') }}, <strong>{{ authStore.username || t('demo.guest') }}</strong></p>
      <p>{{ t('demo.authenticated') }}: <strong>{{ authStore.isAuthenticated }}</strong></p>
      <p>{{ t('demo.permissions') }}: <code>{{ authStore.permissions.join(', ') }}</code></p>
      <hr>
      <h3>{{ t('demo.apiCallLog') }}:</h3>
      <pre>{{ apiResponse }}</pre>
    </div>

    <div class="card">
      <h2>{{ t('demo.permissionTest') }}</h2>
      <p v-html="t('demo.wildcardPermissionDesc')" />
      <button v-permission="'btn:user:create'">
        {{ t('demo.createUser') }}
      </button>
      <button v-permission="'btn:user:delete'">
        {{ t('demo.deleteUser') }}
      </button>
      <button v-permission="'page:dashboard:view'">
        {{ t('demo.viewDashboard') }}
      </button>
    </div>

    <div class="card">
      <h2>{{ t('demo.userList') }}</h2>
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
