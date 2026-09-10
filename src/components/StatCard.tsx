import { defineComponent, h } from 'vue'
import type { Component, PropType } from 'vue'
import { ElIcon } from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    suffix: { type: String, default: '' },
    /** 环比变化，正数向上（红/绿请按业务语境自行调整） */
    trend: { type: Number, default: 0 },
    icon: { type: Object as PropType<Component>, default: undefined },
    /** 图标底色，取 antd 语义色 */
    tone: {
      type: String as PropType<'primary' | 'success' | 'warning' | 'error'>,
      default: 'primary',
    },
  },
  setup(props) {
    const toneMap = {
      primary: 'bg-primary-bg text-primary',
      success: 'bg-[#f6ffed] text-success dark:bg-[#162312]',
      warning: 'bg-[#fffbe6] text-warning dark:bg-[#2b2111]',
      error: 'bg-[#fff2f0] text-error dark:bg-[#2c1618]',
    } as const

    return () => {
      const Icon = props.icon
      const up = props.trend >= 0

      return (
        <div class="app-card app-card-hoverable p-5">
          <div class="flex items-start justify-between gap-3">
            <span class="text-sm text-text-secondary">{props.label}</span>
            {Icon ? (
              <div
                class={[
                  'flex size-9 shrink-0 items-center justify-center rounded-antd text-lg',
                  toneMap[props.tone],
                ]}
              >
                <ElIcon>{h(Icon)}</ElIcon>
              </div>
            ) : null}
          </div>

          <div class="mt-3 flex items-baseline gap-1">
            <span class="text-3xl font-semibold tabular-nums">{props.value}</span>
            {props.suffix ? (
              <span class="text-sm text-text-tertiary">{props.suffix}</span>
            ) : null}
          </div>

          <div class="mt-2 flex items-center gap-1 text-sm">
            <span class={up ? 'text-[#ff4d4f]' : 'text-[#52c41a]'}>
              <ElIcon size={12}>{up ? <ArrowUp /> : <ArrowDown />}</ElIcon>
              {Math.abs(props.trend)}%
            </span>
            <span class="text-text-tertiary">较上周</span>
          </div>
        </div>
      )
    }
  },
})
