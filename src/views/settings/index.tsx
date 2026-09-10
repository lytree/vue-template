import { defineComponent } from 'vue'
import { ElSwitch } from 'element-plus'
import PageContainer from '@/components/PageContainer'
import { useAppStore } from '@/stores'

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
  { label: '样式', value: 'Tailwind CSS 4 + antd 设计令牌' },
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
            <div class="flex flex-col gap-4">
              {/* 外观 */}
              <div class="app-card p-5">
                <h3 class="text-base font-semibold">外观</h3>
                <div class="mt-4 divide-y divide-border-secondary">
                  <div class="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div class="text-base">暗色模式</div>
                      <div class="mt-0.5 text-sm text-text-tertiary">
                        在 &lt;html&gt; 上切换 .dark，antd 令牌与 Element Plus 会同步变化
                      </div>
                    </div>
                    <ElSwitch
                      modelValue={appStore.dark}
                      onUpdate:modelValue={() => appStore.toggleDark()}
                    />
                  </div>

                  <div class="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div class="text-base">收起侧边栏</div>
                      <div class="mt-0.5 text-sm text-text-tertiary">仅保留图标，便于在窄屏下浏览</div>
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
              <div class="app-card p-5">
                <h3 class="text-base font-semibold">设计令牌</h3>
                <p class="mt-1 text-sm text-text-tertiary">
                  定义在 src/styles/index.css 的 :root 中，通过 Tailwind 的 @theme inline
                  暴露为工具类。
                </p>
                <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {TOKENS.map((token) => (
                    <div
                      key={token.name}
                      class="rounded-antd border border-border-secondary p-3"
                    >
                      <div
                        class="h-10 w-full rounded-antd-sm border border-border-secondary"
                        style={{ background: token.value }}
                      />
                      <div class="mt-2 font-mono text-sm">{token.name}</div>
                      <div class="mt-0.5 text-sm text-text-tertiary">{token.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 技术栈 */}
              <div class="app-card p-5">
                <h3 class="text-base font-semibold">技术栈</h3>
                <dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  {STACK.map((item) => (
                    <div key={item.label} class="flex gap-3 border-b border-border-secondary pb-3">
                      <dt class="w-20 shrink-0 text-sm text-text-tertiary">{item.label}</dt>
                      <dd class="text-sm">{item.value}</dd>
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
