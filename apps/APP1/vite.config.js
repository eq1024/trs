import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [vue()],
    esbuild: { drop: ['console', 'debugger'] },
    // 指定加载 .env 文件的目录为 monorepo 的根目录
    envDir: path.resolve(__dirname, '../../'),
    resolve: {
      alias: isDev
        ? {
            '@': path.resolve(__dirname, './src'),
            '@trs/ui': path.resolve(__dirname, '../../packages/ui/index.ts'),
            '@trs/utils': path.resolve(__dirname, '../../packages/utils/index.ts'),
            '@trs/fetch': path.resolve(__dirname, '../../packages/fetch/src/index.ts'),
            // config 和 lint 包没有 src 入口, 不需要别名
          }
        : {},
    },
  }
})
