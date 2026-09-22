import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
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
