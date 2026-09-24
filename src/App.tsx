import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
// 注：ElConfigProvider 仍是显式 import —— vue-jsx 转换后 unplugin 扫不到
// JSX 里的 PascalCase 标签，无法自动注入 GlobalComponents 声明；
// 但 unplugin 仍会按需去重并只打包对应 SCSS，不影响按需优化效果。
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <ElConfigProvider locale={zhCn}>
        <RouterView />
      </ElConfigProvider>
    )
  },
})
