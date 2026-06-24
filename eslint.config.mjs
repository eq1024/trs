import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import lint from '@trs/lint'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const config = lint({
  rules: {
    'no-alert': 'off',
    'no-console': 'off',
  },
})

// 动态扫描子应用，自动引入并分发其专属配置
const appsDir = join(__dirname, 'apps')
if (existsSync(appsDir)) {
  const apps = readdirSync(appsDir)
  for (const app of apps) {
    const appConfigPath = join(appsDir, app, 'eslint.config.mjs')
    if (existsSync(appConfigPath)) {
      const { default: appConfig } = await import(`./apps/${app}/eslint.config.mjs`)
      // 优雅地 await 异步 Composer 实例以获取标准的 Flat Config 数组
      const configs = await appConfig

      config.append(
        ...(Array.isArray(configs) ? configs : [configs]).map(c => ({
          ...c,
          files: [`apps/${app}/**/*`],
        })),
      )
    }
  }
}

export default config
