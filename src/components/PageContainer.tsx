/** 页面外壳：统一标题 / 描述 / 右上角操作区的间距与排版 */
import { defineComponent } from 'vue'
import * as u from '@/styles/utility.css'

export default defineComponent({
  name: 'PageContainer',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => (
      <div class={`${u.stackCol}`}>
        <div class={`${u.flex} ${u.flexWrap} ${u.itemsEnd} ${u.justifyBetween} ${u.gap3}`}>
          <div>
            <h2 class={`${u.textXl} ${u.fontSemibold}`}>{props.title}</h2>
            {props.subtitle ? (
              <p class={`${u.mt1} ${u.textSm} ${u.textTextTertiary}`}>{props.subtitle}</p>
            ) : null}
          </div>
          {slots.extra ? (
            <div class={`${u.flex} ${u.itemsCenter} ${u.gap2}`}>{slots.extra()}</div>
          ) : null}
        </div>
        {slots.default?.()}
      </div>
    )
  },
})
