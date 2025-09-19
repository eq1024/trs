import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [vue(), vueDevTools()],
    envDir: path.resolve(__dirname, '../../'),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        ...(isDev && {
          '@trs/ui': path.resolve(__dirname, '../../packages/ui/index.js'),
          '@trs/utils': path.resolve(__dirname, '../../packages/utils/index.js'),
          '@trs/fetch': path.resolve(__dirname, '../../packages/fetch/src/index.ts'),
          // config 和 lint 包没有 src 入口, 不需要别名
        }),
      },
    },
  }
})
