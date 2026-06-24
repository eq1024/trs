import { createInterface } from 'node:readline'
import { mkdirSync, writeFileSync, existsSync, cpSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = resolve(__dirname, '..')
const appsDir = join(root, 'apps')

if (!existsSync(appsDir)) {
  console.error('未找到 apps 目录，请在项目根目录执行此脚本')
  process.exit(1)
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => {
    rl.close()
    resolve(answer.trim())
  }))
}

const name = await ask('应用名称 (如 APP3): ')
if (!name) {
  console.error('应用名称不能为空')
  process.exit(1)
}

const appDir = join(appsDir, name)
if (existsSync(appDir)) {
  console.error(`应用 ${name} 已存在`)
  process.exit(1)
}

const useEnv = await ask('是否需要独立的环境变量文件? (y/n, 默认 n): ')

// ── 目录 ──
mkdirSync(appDir)
mkdirSync(join(appDir, 'src'))
mkdirSync(join(appDir, 'public'))
mkdirSync(join(appDir, '.vscode'))

// ── package.json ──
const pkg = {
  name,
  type: 'module',
  version: '0.0.0',
  private: true,
  scripts: {
    dev: 'vite',
    'build:dev': 'vite build --mode development',
    'build:prod': 'vite build',
    preview: 'vite preview',
    'deploy:dev': `bash ../../scripts/deploy.sh ${name} dev`,
    'deploy:prod': `bash ../../scripts/deploy.sh ${name} prod`,
    lint: 'eslint .',
  },
  dependencies: {
    '@trs/config': 'workspace:*',
    '@trs/lint': 'workspace:*',
    '@trs/fetch': 'workspace:*',
    '@trs/i18n': 'workspace:*',
    '@trs/permission': 'workspace:*',
    '@trs/ui': 'workspace:*',
    '@trs/utils': 'workspace:*',
    pinia: '^3.0.4',
    vue: '^3.5.38',
  },
  devDependencies: {
    '@vitejs/plugin-vue': '^6.0.7',
    eslint: '^10.5.0',
    vite: '^8.1.0',
  },
}
writeFileSync(join(appDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

// ── vite.config.js ──
writeFileSync(join(appDir, 'vite.config.js'), `import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  const envDir = resolve(__dirname, '\${useEnv === 'y' ? "." : "../../"}')
  const rootEnv = loadEnv(mode, resolve(__dirname, '../../'), 'VITE_')
  const ownEnv = loadEnv(mode, envDir, 'VITE_')

  return {
    plugins: [vue()],
    envDir,
    resolve: {
      dedupe: ['vue'],
      alias: {
        '@': resolve(__dirname, './src'),
        ...(isDev
          ? {
              '@trs/ui': resolve(__dirname, '../../packages/ui/index.ts'),
              '@trs/utils': resolve(__dirname, '../../packages/utils/src/index.ts'),
              '@trs/fetch': resolve(__dirname, '../../packages/fetch/src/index.ts'),
              '@trs/i18n': resolve(__dirname, '../../packages/i18n/index.ts'),
              '@trs/permission': resolve(__dirname, '../../packages/permission/src/index.ts'),
            }
          : {}),
      },
    },
    define: {
      __APP_ENV__: JSON.stringify({ ...rootEnv, ...ownEnv }),
    },
    build: {
      ...(!isDev && {
        esbuild: {
          drop: ['console', 'debugger'],
        },
      }),
    },
  }
})
`)

// ── eslint.config.mjs ──
writeFileSync(join(appDir, 'eslint.config.mjs'), `import lint from '@trs/lint'

export default lint({
  rules: {
    'no-alert': 'off',
    'no-console': 'off',
  },
})
`)

// ── index.html ──
writeFileSync(join(appDir, 'index.html'), `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`)

// ── jsconfig.json ──
writeFileSync(join(appDir, 'jsconfig.json'), JSON.stringify({
  compilerOptions: {
    baseUrl: '.',
    paths: { '@/*': ['./src/*'] },
    composite: true,
    types: ['vite/client'],
  },
  include: ['src/**/*', 'vite.config.js'],
}, null, 2) + '\n')

// ── src/main.js ──
writeFileSync(join(appDir, 'src', 'main.js'), `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setupI18n } from '@trs/i18n'
import { setupPermissionDirective } from '@trs/permission'
import { useAuthStore } from './stores/auth'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(setupI18n())

setupPermissionDirective(app, {
  getAuthStore: () => useAuthStore(),
})

app.mount('#app')
`)

mkdirSync(join(appDir, 'src', 'stores'))
mkdirSync(join(appDir, 'src', 'assets'))

// ── stores/auth.ts ──
writeFileSync(join(appDir, 'src', 'stores', 'auth.ts'), `import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PermissionString } from '@trs/permission'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const username = ref('')
  const permissions = ref<PermissionString[]>([])

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearToken() {
    token.value = null
    localStorage.removeItem('token')
  }

  function setProfile(profile: { username: string; permissions: PermissionString[] }) {
    username.value = profile.username
    permissions.value = profile.permissions
  }

  return { token, username, permissions, isAuthenticated, setToken, clearToken, setProfile }
})
`)

// ── App.vue ──
writeFileSync(join(appDir, 'src', 'App.vue'), `<script setup>
import { useI18n } from '@trs/i18n'

const { t, locale } = useI18n()
</script>

<template>
  <div class="app">
    <h1>{{ t('demo.title') }}</h1>
    <button @click="locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'">
      {{ locale === 'zh-CN' ? '切换到英文' : '切换到中文' }}
    </button>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
</style>
`)

// ── 样式 ──
writeFileSync(join(appDir, 'src', 'assets', 'main.css'), `@import './base.css';

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
}
`)

writeFileSync(join(appDir, 'src', 'assets', 'base.css'), `:root {
  --color-background: #ffffff;
  --color-text: #213547;
  --color-heading: #1a1a1a;
  --color-border: #e2e2e2;
  --section-gap: 160px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-text: rgba(255, 255, 255, 0.87);
    --color-heading: #ffffff;
    --color-border: #333333;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

body {
  color: var(--color-text);
  background: var(--color-background);
  font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
}
`)

// ── api.ts ──
writeFileSync(join(appDir, 'src', 'api.ts'), `import { createHttpClient, createApi } from '@trs/fetch'
import { useAuthStore } from './stores/auth'

const handlers = {
  getToken: () => {
    const authStore = useAuthStore()
    return authStore.token
  },
  clearToken: () => {
    const authStore = useAuthStore()
    authStore.clearToken()
  },
  showError: (message: string) => {
    console.error(message)
  },
}

const httpClient = createHttpClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/mock',
  handlers,
})

export default createApi(httpClient)
`)

// ── .vscode/extensions.json ──
writeFileSync(join(appDir, '.vscode', 'extensions.json'), JSON.stringify({
  recommendations: ['Vue.volar'],
}, null, 2) + '\n')

// ── .gitignore ──
writeFileSync(join(appDir, '.gitignore'), `dist
node_modules
*.local
`)

// ── 独立环境变量 ──
if (useEnv === 'y') {
  writeFileSync(join(appDir, '.env.development'), `# ${name} 开发环境变量
# 如果需要覆盖根目录的公共变量，在此定义同名的 VITE_* 变量即可
VITE_API_BASE_URL=/api
`)
  writeFileSync(join(appDir, '.env.production'), `# ${name} 生产环境变量
VITE_API_BASE_URL=
`)
  console.log(`已创建 ${name}/.env.development 和 .env.production`)
}

// ── README ──
writeFileSync(join(appDir, 'README.md'), `# ${name}

通过 \`scripts/create-app.js\` 自动生成的应用。
`)

// ── 安装依赖 ──
console.log(`\n应用 ${name} 已生成，正在安装依赖...`)
try {
  execSync('pnpm install', { cwd: root, stdio: 'inherit' })
} catch {
  console.error('请在项目根目录手动执行: pnpm install')
}

console.log(`\n完成。启动: pnpm dev --filter=${name}`)

if (useEnv === 'y') {
  console.log(`\n环境变量说明:`)
  console.log(`  vite.config.js 中 envDir 指向 ${name}/ 目录 (自带 .env.*)`)
  console.log(`  loadEnv 同时加载了根目录公共变量，define.__APP_ENV__ 合并了两者`)
  console.log(`  应用专属变量写在 ${name}/.env.* 中，公共变量维持根目录不变`)
}
