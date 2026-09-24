import { defineConfig } from 'vitest/config'
import vueJsx from 'vue-jsx/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 测试文件用 happy-dom（DOM 环境）
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false, // 测试不引入 vanilla-extract CSS 编译
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    // 项目用 vue-jsx（不是 plugin-vue）—— TSX 文件需要它
    vueJsx({ vapor: false }),
  ],
})