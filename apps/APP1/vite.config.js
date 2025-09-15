import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 指定加载 .env 文件的目录为 monorepo 的根目录
  envDir: path.resolve(__dirname, '../../'),
})
