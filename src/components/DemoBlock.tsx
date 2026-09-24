import { defineComponent } from 'vue'
import * as u from '@/styles/utility'
import s from './DemoBlock.module.scss'

/**
 * 组件示例卡片：统一「标题 /说明 / 预览区 / 易错点」的排版。
 *
 * - 默认预览区是行内 flex 居中排布，适合按钮、标签
 * - 传入 `block` 后预览区变为普通块级容器，适合表格、表单
 * - `footer` 插槽用来写组件在 TSX 里的调用要点
 */
export default defineComponent({
  name: 'DemoBlock',
  props: {
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    block: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => (
      <section class={`${u.appCard} ${u.overflowHidden}`}>
        <header class={s.headerBorder}>
          <h3 class={`${u.textBase} ${u.fontSemibold}`}>{props.title}</h3>
          {props.desc ? (
            <p class={`${u.mt1} ${u.textSm} ${u.textTextTertiary}`}>{props.desc}</p>
          ) : null}
        </header>

        <div class={props.block ? s.previewBlock : s.previewInline}>{slots.default?.()}</div>

        {slots.footer ? <footer class={s.footerBorder}>{slots.footer()}</footer> : null}
      </section>
    )
  },
})
