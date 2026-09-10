import { defineComponent } from 'vue'

/**
 * 组件示例卡片：统一「标题 / 说明 / 预览区 / 易错点」的排版。
 *
 * - 默认预览区是 `flex flex-wrap items-center gap-3`，适合按钮、标签这类行内组件
 * - 传入 `block` 后预览区变为普通块级容器，适合表格、表单这类需要占满宽度的组件
 * - `footer` 插槽用来写这个组件在 **TSX 里的调用要点**（具名插槽、事件名等）
 */
export default defineComponent({
  name: 'DemoBlock',
  props: {
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    /** 预览区改为块级布局（默认是行内 flex 居中排布） */
    block: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => (
      <section class="app-card overflow-hidden">
        <header class="border-b border-border-secondary px-5 py-3">
          <h3 class="text-base font-semibold">{props.title}</h3>
          {props.desc ? <p class="mt-1 text-sm text-text-tertiary">{props.desc}</p> : null}
        </header>

        <div class={props.block ? 'p-5' : 'flex flex-wrap items-center gap-3 p-5'}>
          {slots.default?.()}
        </div>

        {slots.footer ? (
          <footer class="border-t border-border-secondary bg-fill-quaternary px-5 py-3 text-sm text-text-tertiary">
            {slots.footer()}
          </footer>
        ) : null}
      </section>
    )
  },
})
