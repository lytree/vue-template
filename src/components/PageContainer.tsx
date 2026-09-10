import { defineComponent } from 'vue'

/** 页面外壳：统一标题 / 描述 / 右上角操作区的间距与排版 */
export default defineComponent({
  name: 'PageContainer',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () => (
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">{props.title}</h2>
            {props.subtitle ? (
              <p class="mt-1 text-sm text-text-tertiary">{props.subtitle}</p>
            ) : null}
          </div>
          {slots.extra ? <div class="flex items-center gap-2">{slots.extra()}</div> : null}
        </div>
        {slots.default?.()}
      </div>
    )
  },
})
