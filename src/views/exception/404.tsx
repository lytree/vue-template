import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'

export default defineComponent({
  name: 'NotFoundPage',
  setup() {
    const router = useRouter()

    return () => (
      <div class="flex h-full min-h-screen flex-col items-center justify-center gap-3 bg-layout px-6 text-center">
        <div class="text-3xl font-bold tracking-widest text-primary">
          <span class="text-[96px] leading-none">404</span>
        </div>
        <p class="text-xl font-medium">抱歉，你访问的页面不存在</p>
        <p class="text-sm text-text-tertiary">请检查地址是否正确，或返回首页继续浏览。</p>
        <div class="mt-3 flex gap-2">
          <ElButton type="primary" onClick={() => router.push('/dashboard')}>
            返回首页
          </ElButton>
          <ElButton onClick={() => router.back()}>返回上一页</ElButton>
        </div>
      </div>
    )
  },
})
