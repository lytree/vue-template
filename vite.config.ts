import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueJsx from 'vue-jsx/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

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

    // ✅ 按需自动引入 Vue / Vue Router / Pinia / Element Plus API
    //   业务代码里直接用 ref / computed / useRoute / ElMessage 等，无需 import。
    //   类型声明由插件生成到 src/auto-imports.d.ts（已加入 .gitignore）。
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
      eslintrc: { enabled: false },
    }),

    // ✅ 按需自动注册 Element Plus 组件 + 业务 src/components 下的组件
    //   业务代码里直接写 <ElButton> / <DemoBlock>，无需 import 和 components 注册。
    //   类型声明由插件生成到 src/components.d.ts（已加入 .gitignore）。
    Components({
      // 不需要扫描业务目录（项目目前都是显式 import，没有 src/components/Demo.vue 这种约定式组件）
      dirs: [],
      // Element Plus 按需：仅打包用到的组件 + 对应 SCSS
      resolvers: [
        ElementPlusResolver({
          // 'sass' 对应 EP 的 *.scss 文件（与 'css' 等价的 SCSS 版本）
          importStyle: 'sass',
        }),
      ],
      // Element Plus 暗色变量 SCSS（替换原来 main.tsx 的 dark/css-vars.css）
      // —— 通过 unplugin 自动按需注入，无需手写 import
      dts: 'src/components.d.ts',
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
