import { defineComponent } from 'vue'
import { ElIcon } from 'element-plus'
import {
  DataLine,
  Money,
  ShoppingCart,
  User,
  Timer,
  Top,
  Bottom,
  Right,
} from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer'
import StatCard from '@/components/StatCard'
import { useUserStore } from '@/stores'

const STATS = [
  { label: '今日活跃用户', value: '12,846', suffix: '人', trend: 12.4, icon: User, tone: 'primary' as const },
  { label: '订单总量', value: '3,271', suffix: '笔', trend: 8.1, icon: ShoppingCart, tone: 'success' as const },
  { label: '今日成交额', value: '¥ 98,420', suffix: '', trend: -3.2, icon: Money, tone: 'warning' as const },
  { label: '平均响应耗时', value: '184', suffix: 'ms', trend: -6.7, icon: Timer, tone: 'error' as const },
]

const SHORTCUTS = [
  { title: '查询表格', desc: '带筛选条件的列表页', path: '/list/table' },
  { title: '表单页', desc: '基础表单与校验', path: '/form' },
  { title: '系统设置', desc: '主题与偏好配置', path: '/settings' },
]

const ACTIVITIES = [
  { user: '林晚', action: '创建了订单', target: '#20240910-0042', time: '2 分钟前' },
  { user: '周予安', action: '更新了商品', target: '无线降噪耳机 Pro', time: '18 分钟前' },
  { user: '许知遥', action: '导出了报表', target: '2024 年 8 月经营月报', time: '1 小时前' },
  { user: '陈墨', action: '审批通过了', target: '退款申请 #8891', time: '3 小时前' },
  { user: '系统', action: '完成了每日备份', target: '全量备份 2.4 GB', time: '6 小时前' },
]

export default defineComponent({
  name: 'DashboardPage',
  setup() {
    const userStore = useUserStore()

    return () => (
      <PageContainer
        title={`你好，${userStore.info.name} 👋`}
        subtitle="这是一份基于 Ant Design 设计语言的 Vue 3 + TSX 后台模板起点。"
      >
        {{
          default: () => (
            <div class="flex flex-col gap-4">
              {/* 指标卡 */}
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map((item) => (
                  <StatCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    suffix={item.suffix}
                    trend={item.trend}
                    icon={item.icon}
                    tone={item.tone}
                  />
                ))}
              </div>

              <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {/* 快捷入口 */}
                <div class="app-card p-5 xl:col-span-2">
                  <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold">快捷入口</h3>
                    <span class="text-sm text-text-tertiary">常用功能一键直达</span>
                  </div>
                  <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {SHORTCUTS.map((item) => (
                      <router-link
                        key={item.path}
                        to={item.path}
                        class="group flex items-center justify-between gap-2 rounded-antd border border-border-secondary px-4 py-3 transition-colors hover:border-primary-border hover:bg-primary-bg"
                      >
                        <div class="min-w-0">
                          <div class="truncate text-base font-medium">{item.title}</div>
                          <div class="mt-0.5 truncate text-sm text-text-tertiary">
                            {item.desc}
                          </div>
                        </div>
                        <ElIcon class="shrink-0 text-text-quaternary transition-colors group-hover:text-primary">
                          <Right />
                        </ElIcon>
                      </router-link>
                    ))}
                  </div>

                  <div class="mt-6 flex items-center justify-between border-t border-border-secondary pt-4">
                    <h3 class="text-base font-semibold">访问趋势</h3>
                    <div class="flex items-center gap-3 text-sm text-text-tertiary">
                      <span class="flex items-center gap-1">
                        <ElIcon class="text-[#ff4d4f]"><Top /></ElIcon>
                        上涨 12.4%
                      </span>
                      <span class="flex items-center gap-1">
                        <ElIcon class="text-[#52c41a]"><Bottom /></ElIcon>
                        下跌 3.2%
                      </span>
                    </div>
                  </div>
                  <div class="mt-4 flex h-32 items-end gap-2">
                    {[38, 52, 44, 66, 58, 74, 62, 88, 70, 96, 82, 100].map((h, i) => (
                      <div
                        key={i}
                        class="flex-1 rounded-t-[3px] bg-primary/85 transition-all hover:bg-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* 最近动态 */}
                <div class="app-card p-5">
                  <h3 class="text-base font-semibold">最近动态</h3>
                  <ul class="mt-4 flex flex-col gap-4">
                    {ACTIVITIES.map((item) => (
                      <li key={item.target} class="flex gap-3">
                        <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <div class="min-w-0">
                          <div class="text-sm">
                            <span class="font-medium">{item.user}</span>
                            <span class="text-text-secondary"> {item.action} </span>
                            <span class="text-primary">{item.target}</span>
                          </div>
                          <div class="mt-0.5 text-sm text-text-quaternary">
                            <ElIcon size={12} class="mr-1">
                              <DataLine />
                            </ElIcon>
                            {item.time}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
