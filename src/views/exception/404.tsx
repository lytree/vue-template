import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import * as u from '@/styles/utility.css'
import * as s from './404.css'

export default defineComponent({
  name: 'NotFoundPage',
  setup() {
    const router = useRouter()

    return () => (
      <div
        class={`${u.flex} ${u.hFull} ${u.minHScreen} ${u.flexCol} ${u.itemsCenter} ${u.justifyCenter} ${u.gap3} ${u.bgLayout} ${u.px6} ${u.textCenter}`}
      >
        <div class={s.titleText}>404</div>
        <p class={`${u.textXl} ${u.fontMedium}`}>抱歉，你访问的页面不存在</p>
        <p class={`${u.textSm} ${u.textTextTertiary}`}>
          请检查地址是否正确，或返回首页继续浏览。
        </p>
        <div class={`${u.mt3} ${u.flex} ${u.gap2}`}>
          <ElButton type="primary" onClick={() => router.push('/dashboard')}>
            返回首页
          </ElButton>
          <ElButton onClick={() => router.back()}>返回上一页</ElButton>
        </div>
      </div>
    )
  },
})
