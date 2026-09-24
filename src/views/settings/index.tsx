import { defineComponent } from 'vue'
import { ElSwitch } from 'element-plus'
import PageContainer from '@/components/PageContainer'
import { useAppStore } from '@/stores'
import * as u from '@/styles/utility.css'
import s from './index.module.scss'

const TOKENS = [
  { name: '--ant-color-primary', value: '#1677ff', note: '品牌主色 / 链接 / 选中态' },
  { name: '--ant-color-success', value: '#52c41a', note: '成功' },
  { name: '--ant-color-warning', value: '#faad14', note: '警告' },
  { name: '--ant-color-error', value: '#ff4d4f', note: '错误 / 危险操作' },
  { name: '--ant-color-text', value: 'rgba(0,0,0,.88)', note: '主文本' },
  { name: '--ant-color-text-tertiary', value: 'rgba(0,0,0,.45)', note: '次要文本' },
  { name: '--ant-color-bg-layout', value: '#f5f5f5', note: '页面底色' },
  { name: '--ant-border-radius', value: '6px', note: '控件圆角' },
]

const STACK = [
  { label: '框架', value: 'Vue 3.6.0-rc.7（Composition API）' },
  { label: '语言', value: 'TypeScript + TSX（无 .vue 单文件组件）' },
  { label: '构建', value: 'Vite 8 + vue-jsx（Oxc 编译器，虚拟 DOM 模式）' },
  { label: 'UI 组件', value: 'Element Plus（主题映射为 Ant Design 5）' },
  { label: '样式', value: 'vanilla-extract（CSS-in-TS，零运行时，编译时生成真 CSS）' },
  { label: '状态', value: 'Pinia 4（Setup Store）' },
  { label: '路由', value: 'Vue Router 5' },
]

export default defineComponent({
  name: 'SettingsPage',
  setup() {
    const appStore = useAppStore()

    return () => (
      <PageContainer title="系统设置" subtitle="外观偏好与当前模板的设计令牌速览。">
        {{
          default: () => (
            <div class={u.stackCol}>
              {/* 外观 */}
              <div class={`${u.appCard} ${u.p5}`}>
                <h3 class={`${u.textBase} ${u.fontSemibold}`}>外观</h3>
                <div class={`${u.mt4} ${u.divideY}`}>
                  <div class={s.settingRow}>
                    <div>
                      <div class={u.textBase}>暗色模式</div>
                      <div class={`${u.mt0_5} ${u.textSm} ${u.textTextTertiary}`}>
                        在 &lt;html&gt; 上切换 .dark，antd 令牌与 Element Plus 会同步变化
                      </div>
                    </div>
                    <ElSwitch
                      modelValue={appStore.dark}
                      onUpdate:modelValue={() => appStore.toggleDark()}
                    />
                  </div>

                  <div class={s.settingRow}>
                    <div>
                      <div class={u.textBase}>收起侧边栏</div>
                      <div class={`${u.mt0_5} ${u.textSm} ${u.textTextTertiary}`}>
                        仅保留图标，便于在窄屏下浏览
                      </div>
                    </div>
                    <ElSwitch
                      modelValue={appStore.collapsed}
                      onUpdate:modelValue={(value: string | number | boolean) =>
                        appStore.setCollapsed(Boolean(value))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 令牌 */}
              <div class={`${u.appCard} ${u.p5}`}>
                <h3 class={`${u.textBase} ${u.fontSemibold}`}>设计令牌</h3>
                <p class={`${u.mt1} ${u.textSm} ${u.textTextTertiary}`}>
                  定义在 src/styles/tokens.css 的 :root 中，通过 vanilla-extract 的
                  globalStyle 与 utility 工具类引用。
                </p>
                <div
                  class={`${u.mt4} ${u.grid} ${u.gridCols1} ${u.gap3} ${u.smGridCols2} ${u.xlGridCols4}`}
                >
                  {TOKENS.map((token) => (
                    <div
                      key={token.name}
                      class={`${u.rounded} ${u.border} ${u.borderSecondary} ${u.p3}`}
                    >
                      <div class={s.swatchBlock} style={{ background: token.value }} />
                      <div class={`${u.mt2} ${u.fontMono} ${u.textSm}`}>{token.name}</div>
                      <div class={`${u.mt0_5} ${u.textSm} ${u.textTextTertiary}`}>
                        {token.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 技术栈 */}
              <div class={`${u.appCard} ${u.p5}`}>
                <h3 class={`${u.textBase} ${u.fontSemibold}`}>技术栈</h3>
                <dl
                  class={`${u.mt4} ${u.grid} ${u.gridCols1} ${u.gapX8} ${u.gapY3} ${u.smGridCols2}`}
                >
                  {STACK.map((item) => (
                    <div
                      key={item.label}
                      class={`${u.flex} ${u.gap3} ${u.borderB} ${u.pb3}`}
                    >
                      <dt class={`${u.w20} ${u.shrink0} ${u.textSm} ${u.textTextTertiary}`}>
                        {item.label}
                      </dt>
                      <dd class={u.textSm}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
