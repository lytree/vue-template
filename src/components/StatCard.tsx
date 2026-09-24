import { defineComponent, h } from 'vue'
import type { Component, PropType } from 'vue'
import { ElIcon } from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import * as u from '@/styles/utility.css'
import s from './StatCard.module.scss'

/** tone → className 映射（与 SCSS Modules 中同名 class 一一对应） */
const toneBg: Record<'primary' | 'success' | 'warning' | 'error', string> = {
  primary: s.primary,
  success: s.success,
  warning: s.warning,
  error: s.error,
}

export default defineComponent({
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    suffix: { type: String, default: '' },
    /** 环比变化，正数向上 */
    trend: { type: Number, default: 0 },
    icon: { type: Object as PropType<Component>, default: undefined },
    tone: {
      type: String as PropType<'primary' | 'success' | 'warning' | 'error'>,
      default: 'primary',
    },
  },
  setup(props) {
    return () => {
      const Icon = props.icon
      const up = props.trend >= 0

      return (
        <div class={`${u.appCard} ${u.appCardHoverable} ${u.p5}`}>
          <div class={`${u.flex} ${u.itemsStart} ${u.justifyBetween} ${u.gap3}`}>
            <span class={`${u.textSm} ${u.textTextSecondary}`}>{props.label}</span>
            {Icon ? (
              <div
                class={`${u.flex} ${u.size9} ${u.shrink0} ${u.itemsCenter} ${u.justifyCenter} ${u.rounded} ${u.textLg} ${toneBg[props.tone]}`}
              >
                <ElIcon>{h(Icon)}</ElIcon>
              </div>
            ) : null}
          </div>

          <div class={`${u.mt3} ${u.flex} ${u.itemsBaseline} ${u.gap1}`}>
            <span class={`${u.text3xl} ${u.fontSemibold} ${u.tabularNums}`}>{props.value}</span>
            {props.suffix ? (
              <span class={`${u.textSm} ${u.textTextTertiary}`}>{props.suffix}</span>
            ) : null}
          </div>

          <div class={`${u.mt2} ${u.flex} ${u.itemsCenter} ${u.gap1} ${u.textSm}`}>
            <span class={up ? u.trendUp : u.trendDown}>
              <ElIcon size={12}>{up ? <ArrowUp /> : <ArrowDown />}</ElIcon>
              {Math.abs(props.trend)}%
            </span>
            <span class={u.textTextTertiary}>较上周</span>
          </div>
        </div>
      )
    }
  },
})
