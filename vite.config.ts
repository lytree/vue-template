import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueJsx from 'vue-jsx/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vueJsx({
      // 纯虚拟 DOM 模式：不生成任何 Vapor 输出（Element Plus 是 vDOM 组件库）
      vapor: false,
      // 编译器优化：插槽稳定性检测 / 事件处理器缓存 / block tree。
      // ⚠️ 官方注明该项「仅在 interop 模式下生效」，当前未开 interop，故实际不产生效果。
      optimize: true,
      // JSXSpreadAttribute 走 Vue 的 mergeProps 语义（class/style/事件合并而非覆盖）。
      // 该版本默认值即为 true，显式写出以固定行为。
      mergeProps: true,
      // 生成 sourcemap，便于在 devtools 中定位回 .tsx 源码（官方默认为 false）
      sourceMap: true,
      // ✅ 启用 HMR —— 但**必须只在 dev 生效**。
      // vue-jsx@3.3.0-beta.1 在 hmr: true 时会产出无守卫的
      //   `__hmrId = "...", __VUE_HMR_RUNTIME__.createRecord("...", Cmp)`
      // 生产构建里 __VUE_HMR_RUNTIME__ 不存在，会抛 ReferenceError 导致整站白屏。
      // 故用 command 判定：vite dev 为 'serve'，vite build 为 'build'。
      hmr: command === 'serve',
    }),
    tailwindcss(),
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
