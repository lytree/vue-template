import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueJsx from 'vue-jsx/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  css: {
    modules: {
      // SCSS Modules 默认行为：
      //   • camelCase 转换（foo-bar → fooBar），
      //     同时也允许直接用 class="foo-bar"
      localsConvention: 'camelCaseOnly',
      // 生成 TypeScript 友好的 default export（import styles from './x.module.scss'）
      namedExports: true,
      // 类名加前缀便于在 DevTools 识别
      generateScopedName: command === 'serve'
        ? '[name]__[local]___[hash:base64:5]'
        : '[hash:base64:6]',
    },
  },
  plugins: [
    vueJsx({
      // 纯虚拟 DOM 模式：不生成任何 Vapor 输出（Element Plus 是 vDOM 组件库）
      vapor: false,
      optimize: true,
      mergeProps: true,
      sourceMap: true,
      // ✅ 启用 HMR —— 但**必须只在 dev 生效**。
      hmr: command === 'serve',
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    host: true,
    open: true,
  },

  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
}))
