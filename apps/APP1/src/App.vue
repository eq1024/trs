<script setup>
import { useI18n } from '@trs/i18n'
import { onMounted, ref, watch } from 'vue'
import api from './api'
import { useAuthStore } from './stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const activeRole = ref('admin')
const isRequesting = ref(false)
const users = ref([])

const isTranslating = ref(false)
const displayLangText = ref('')
const activeTopologyNode = ref('app1')

// ---- Theme ----
const theme = ref('light')

function applyTheme(t) {
  theme.value = t
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('trs-theme', t)
}

function toggleTheme() {
  applyTheme(theme.value === 'light' ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('trs-theme')
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved)
  }
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark')
  }
})

watch(locale, (newLoc) => {
  isTranslating.value = true
  displayLangText.value = newLoc === 'zh-CN' ? 'ZH-CN' : 'EN-US'
  setTimeout(() => {
    isTranslating.value = false
  }, 500)
}, { immediate: true })

const apiLogs = ref([
  { id: 1, type: 'system', text: 'System initialized. Token verified.' },
  { id: 2, type: 'system', text: 'Workspace links established.' },
  { id: 3, type: 'auth', text: 'Security context: admin credentials active.' },
])

onMounted(async () => {
  try {
    const loginData = await api.auth.login({ username: 'admin', password: 'password' })
    authStore.setToken(loginData.token)

    const profile = await api.auth.getProfile()
    authStore.setProfile(profile)

    const userList = await api.user.getList()
    users.value = userList
  }
  catch (error) {
    console.error('Initialization failed:', error)
    apiLogs.value.push({ id: Date.now(), type: 'error', text: `Initialization failed: ${error.message}` })
  }
})

function changeRole(role) {
  activeRole.value = role
  const timeStr = new Date().toLocaleTimeString()

  if (role === 'admin') {
    authStore.setProfile({
      username: 'trs-admin',
      permissions: ['*'],
    })
    apiLogs.value.push({ id: Date.now(), type: 'auth', text: `[${timeStr}] Role switched to ADMIN. Full access granted.` })
  }
  else if (role === 'dev') {
    authStore.setProfile({
      username: 'trs-senior-dev',
      permissions: ['btn:user:create', 'page:dashboard:view'],
    })
    apiLogs.value.push({ id: Date.now(), type: 'auth', text: `[${timeStr}] Role switched to DEV. Scope: btn:user:create, page:dashboard:view` })
  }
  else {
    authStore.setProfile({
      username: 'trs-guest',
      permissions: [],
    })
    apiLogs.value.push({ id: Date.now(), type: 'auth', text: `[${timeStr}] Role switched to GUEST. All permissions revoked.` })
  }
}

async function triggerRequest() {
  if (isRequesting.value)
    return
  isRequesting.value = true
  const timeStr = new Date().toLocaleTimeString()

  apiLogs.value.push({ id: Date.now() + 1, type: 'info', text: `[${timeStr}] Dispatching POST /api/mock/echo` })

  await new Promise(r => setTimeout(r, 450))
  const mockFp = `FP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  apiLogs.value.push({ id: Date.now() + 2, type: 'success', text: `[${timeStr}] Fingerprint injected: ${mockFp}` })

  await new Promise(r => setTimeout(r, 350))
  const truncatedToken = authStore.token ? `${authStore.token.substring(0, 16)}...` : 'N/A'
  apiLogs.value.push({ id: Date.now() + 3, type: 'info', text: `[${timeStr}] Auth header: Bearer ${truncatedToken}` })

  await new Promise(r => setTimeout(r, 600))
  apiLogs.value.push({ id: Date.now() + 4, type: 'success', text: `[${timeStr}] Response: 200 OK` })
  apiLogs.value.push({ id: Date.now() + 5, type: 'success', text: `[${timeStr}] Cache deployed.` })

  isRequesting.value = false
}

function clearConsole() {
  apiLogs.value = [{ id: Date.now(), type: 'system', text: 'Terminal reset.' }]
}
</script>

<template>
  <div class="shell">
    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-left">
        <span class="nav-logo">TRS</span>
        <span class="nav-version">v1.1.0</span>
      </div>
      <div class="nav-right">
        <button class="theme-toggle" :title="theme === 'light' ? 'Switch to dark' : 'Switch to light'" @click="toggleTheme">
          <span v-if="theme === 'light'">&#9790;</span>
          <span v-else>&#9789;</span>
        </button>
        <div class="nav-metric">
          <span class="metric-dot" />
          <span>System Operational</span>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <header class="hero">
      <div class="hero-text">
        <h1 class="hero-title">
          {{ t('demo.heroTitle') }}
        </h1>
        <p class="hero-desc">
          {{ t('demo.heroSubtitle') }}
        </p>
        <a
          href="https://github.com/eq1024/trs" target="_blank"
          class="hero-cta"
        >
          <svg class="cta-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/>
          </svg>
          {{ t('demo.viewDocs') }}
          <span class="cta-arrow">&rarr;</span>
        </a>
      </div>

      <!-- Workspace Topology: Dependency Tree -->
      <div class="hero-visual">
        <div class="topo">
          <div class="topo-header">
            <span class="topo-label">Workspace Topology</span>
          </div>
          <div class="topo-body">
            <!-- Root: APP1 -->
            <div
              class="topo-root"
              :class="{ active: activeTopologyNode === 'app1' }"
              @mouseenter="activeTopologyNode = 'app1'"
            >
              <span class="topo-root-dot" />
              <span class="topo-root-name">APP1</span>
              <span class="topo-root-tag">Root</span>
            </div>

            <!-- Dependency tree -->
            <div class="topo-tree">
              <div
                class="topo-dep"
                :class="{ active: activeTopologyNode === 'ui' }"
                @mouseenter="activeTopologyNode = 'ui'"
              >
                <span class="topo-dep-dot" />
                <span class="topo-dep-name">@trs/ui</span>
                <span class="topo-dep-meta">0.998s</span>
              </div>
              <div
                class="topo-dep"
                :class="{ active: activeTopologyNode === 'i18n' }"
                @mouseenter="activeTopologyNode = 'i18n'"
              >
                <span class="topo-dep-dot" />
                <span class="topo-dep-name">@trs/i18n</span>
                <span class="topo-dep-meta">0.998s</span>
              </div>
              <div
                class="topo-dep"
                :class="{ active: activeTopologyNode === 'fetch' }"
                @mouseenter="activeTopologyNode = 'fetch'"
              >
                <span class="topo-dep-dot" />
                <span class="topo-dep-name">@trs/fetch</span>
                <span class="topo-dep-meta">0.998s</span>
              </div>
              <div
                class="topo-dep"
                :class="{ active: activeTopologyNode === 'perm' }"
                @mouseenter="activeTopologyNode = 'perm'"
              >
                <span class="topo-dep-dot" />
                <span class="topo-dep-name">@trs/permission</span>
                <span class="topo-dep-meta">0.998s</span>
              </div>
            </div>

            <!-- Info footer -->
            <div class="topo-info">
              <div class="info-row">
                <span class="k">Target</span>
                <span class="v">{{ activeTopologyNode.toUpperCase() }}</span>
              </div>
              <div class="info-row">
                <span class="k">Latency</span>
                <span class="v accent">0.998s</span>
              </div>
              <div class="info-row">
                <span class="k">HMR</span>
                <span class="v accent">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Features Bento Grid -->
    <section class="section">
      <div class="section-header">
        <h2>{{ t('demo.coreFeaturesTitle') }}</h2>
      </div>
      <div class="bento">
        <div class="bento-card card-tall">
          <span class="bento-label">Workspace Sharing</span>
          <h3>{{ t('demo.feat1Title') }}</h3>
          <p>{{ t('demo.feat1Desc') }}</p>
          <div class="bento-chart">
            <span class="chart-label">Compilation Latency</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width: 8%" />
            </div>
            <span class="chart-value">12ms (fastest)</span>
          </div>
        </div>

        <div class="bento-card">
          <span class="bento-label">HMR</span>
          <h3>{{ t('demo.feat2Title') }}</h3>
          <p>{{ t('demo.feat2Desc') }}</p>
        </div>

        <div class="bento-card">
          <span class="bento-label">Caching</span>
          <h3>{{ t('demo.feat3Title') }}</h3>
          <p>{{ t('demo.feat3Desc') }}</p>
        </div>

        <div class="bento-card card-wide">
          <span class="bento-label">Scaffolding</span>
          <h3>{{ t('demo.feat4Title') }}</h3>
          <p>{{ t('demo.feat4Desc') }}</p>
        </div>
      </div>
    </section>

    <!-- Operations Dashboard -->
    <section class="section">
      <div class="section-header">
        <h2>{{ t('demo.interactiveTitle') }}</h2>
        <p>{{ t('demo.interactiveSubtitle') }}</p>
      </div>
      <div class="ops-grid">
        <!-- Panel 1: I18n -->
        <div class="ops-card">
          <div class="ops-card-header">
            <span class="ops-module-tag">I18n</span>
            <span class="ops-status" />
          </div>
          <h3>{{ t('demo.i18nTitle') }}</h3>
          <p>{{ t('demo.i18nDesc') }}</p>

          <div class="i18n-workspace">
            <div class="xcvr-display">
              <div class="xcvr-bars">
                <span class="xcvr-bar" :class="{ active: isTranslating }" />
                <span class="xcvr-bar" :class="{ active: isTranslating }" />
                <span class="xcvr-bar" :class="{ active: isTranslating }" />
                <span class="xcvr-bar" :class="{ active: isTranslating }" />
                <span class="xcvr-bar" :class="{ active: isTranslating }" />
              </div>
              <div class="xcvr-metric">
                <span class="xcvr-metric-label">Status</span>
                <span
                  class="xcvr-metric-value"
                  :class="{ switching: isTranslating }"
                >
                  {{ isTranslating ? 'Switching...' : 'Ready' }}
                </span>
              </div>
              <span
                class="locale-badge"
                :class="{ switching: isTranslating }"
              >
                {{ displayLangText }}
              </span>
            </div>

            <button
              class="btn-switch"
              @click="locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'"
            >
              {{ t('demo.switchBtn') }}
            </button>

            <div class="code-visor">
              <div class="code-visor-header">
                <span class="code-visor-dot" />
                Output
              </div>
              <div class="code-visor-body">
                <pre><code>{
  <span class="c-key">"lang"</span>: <span class="c-string">"{{ t('demo.currentLanguage', { lang: locale }) }}"</span>,
  <span class="c-key">"welcome"</span>: <span class="c-string">"{{ t('demo.welcome') }}"</span>
}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 2: Fetch -->
        <div class="ops-card">
          <div class="ops-card-header">
            <span class="ops-module-tag">Fetch</span>
            <span class="ops-status" />
          </div>
          <h3>{{ t('demo.fetchTitle') }}</h3>
          <p>{{ t('demo.fetchDesc') }}</p>

          <div class="fetch-workspace">
            <button
              class="btn-trigger"
              :class="{ loading: isRequesting }"
              @click="triggerRequest"
            >
              {{ isRequesting ? 'Processing...' : t('demo.triggerApiBtn') }}
            </button>

            <div class="pipeline" :class="{ active: isRequesting }">
              <div class="pipeline-node">
                <span class="pipeline-node-dot" />
                <span class="pipeline-node-label">CLIENT</span>
              </div>
              <div class="pipeline-connector" />
              <div class="pipeline-node">
                <span class="pipeline-node-dot" />
                <span class="pipeline-node-label">AUTH</span>
              </div>
              <div class="pipeline-connector" />
              <div class="pipeline-node">
                <span class="pipeline-node-dot" />
                <span class="pipeline-node-label">GATEWAY</span>
              </div>
            </div>

            <div class="terminal">
              <div class="terminal-header">
                <div class="terminal-dots">
                  <span class="terminal-dot r" />
                  <span class="terminal-dot y" />
                  <span class="terminal-dot g" />
                </div>
                <span class="terminal-title">{{ t('demo.consoleHeader') }}</span>
                <button class="terminal-clear" @click="clearConsole">
                  Clear
                </button>
              </div>
              <div class="terminal-body">
                <div
                  v-for="log in apiLogs"
                  :key="log.id"
                  class="terminal-line"
                  :class="log.type"
                >
                  <span class="terminal-prompt">&gt;</span>
                  <span class="terminal-text">{{ log.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 3: Permission -->
        <div class="ops-card">
          <div class="ops-card-header">
            <span class="ops-module-tag">Permission</span>
            <span class="ops-status" />
          </div>
          <h3>{{ t('demo.permTitle') }}</h3>
          <p>{{ t('demo.permDesc') }}</p>

          <div class="perm-workspace">
            <div class="keycard-group">
              <span class="keycard-group-label">{{ t('demo.selectRole') }}</span>
              <div class="keycard-options">
                <label
                  class="keycard-option"
                  :class="{ selected: activeRole === 'admin' }"
                >
                  <input
                    type="radio" name="role" value="admin" checked
                    @change="changeRole('admin')"
                  >
                  <span class="keycard-radio" />
                  <span class="keycard-text">{{ t('demo.roleAdmin') }}</span>
                </label>
                <label
                  class="keycard-option"
                  :class="{ selected: activeRole === 'dev' }"
                >
                  <input
                    type="radio" name="role" value="dev"
                    @change="changeRole('dev')"
                  >
                  <span class="keycard-radio" />
                  <span class="keycard-text">{{ t('demo.roleDev') }}</span>
                </label>
                <label
                  class="keycard-option"
                  :class="{ selected: activeRole === 'guest' }"
                >
                  <input
                    type="radio" name="role" value="guest"
                    @change="changeRole('guest')"
                  >
                  <span class="keycard-radio" />
                  <span class="keycard-text">{{ t('demo.roleGuest') }}</span>
                </label>
              </div>
            </div>

            <div class="identity-visor">
              <div class="identity-row">
                <span class="identity-label">{{ t('demo.permStatus') }}</span>
                <span
                  class="identity-value"
                  :class="{
                    'role-admin': activeRole === 'admin',
                    'role-dev': activeRole === 'dev',
                    'role-guest': activeRole === 'guest',
                  }"
                >
                  {{ authStore.username || 'GUEST' }}
                </span>
              </div>
              <div class="identity-row">
                <span class="identity-label">{{ t('demo.permList') }}</span>
                <span class="identity-value">
                  <code>{{ authStore.permissions.length ? authStore.permissions.join(', ') : 'none' }}</code>
                </span>
              </div>
            </div>

            <div class="perm-slots">
              <!-- Slot 1: Create -->
              <div class="perm-slot">
                <div class="perm-slot-bg">
                  <span class="perm-slot-id">Dock 01 / Create</span>
                </div>
                <button
                  v-permission="'btn:user:create'"
                  class="perm-key key-create"
                >
                  {{ t('demo.btnCreate') }}
                </button>
              </div>

              <!-- Slot 2: Delete -->
              <div class="perm-slot">
                <div class="perm-slot-bg">
                  <span class="perm-slot-id">Dock 02 / Delete</span>
                </div>
                <button
                  v-permission="'btn:user:delete'"
                  class="perm-key key-delete"
                >
                  {{ t('demo.btnDelete') }}
                </button>
              </div>

              <!-- Slot 3: Dashboard -->
              <div class="perm-slot">
                <div class="perm-slot-bg">
                  <span class="perm-slot-id">Dock 03 / Dashboard</span>
                </div>
                <button
                  v-permission="'page:dashboard:view'"
                  class="perm-key key-dashboard"
                >
                  {{ t('demo.btnDashboard') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Logo Wall -->
    <section class="trust">
      <p class="trust-label">
        Built With
      </p>
      <div class="trust-logos">
        <div class="trust-item">
          <img
            src="https://cdn.simpleicons.org/vuedotjs/00d4aa"
            alt="Vue" class="trust-logo"
          >
          <span class="trust-name">Vue</span>
        </div>
        <div class="trust-item">
          <img
            src="https://cdn.simpleicons.org/vite/00d4aa"
            alt="Vite" class="trust-logo"
          >
          <span class="trust-name">Vite</span>
        </div>
        <div class="trust-item">
          <img
            src="https://cdn.simpleicons.org/turborepo/00d4aa"
            alt="Turborepo" class="trust-logo"
          >
          <span class="trust-name">Turborepo</span>
        </div>
        <div class="trust-item">
          <img
            src="https://cdn.simpleicons.org/pnpm/00d4aa"
            alt="PNPM" class="trust-logo"
          >
          <span class="trust-name">pnpm</span>
        </div>
        <div class="trust-item">
          <img
            src="https://cdn.simpleicons.org/eslint/00d4aa"
            alt="ESLint" class="trust-logo"
          >
          <span class="trust-name">ESLint</span>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p class="footer-copy">
        TRS Platform Labs. All rights reserved.
      </p>
      <p class="footer-meta">
        Build #07F9-X0
      </p>
    </footer>
  </div>
</template>

<style scoped>
pre {
  margin: 0;
}

/* Permission slot key transitions */
.slot-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slot-leave-active {
  transition: all 0.2s ease;
}
.slot-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.slot-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
