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
import * as u from '@/styles/utility.css'
import s from './index.module.scss'

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
            <div class={u.stackCol}>
              {/* 指标卡 */}
              <div class={`${u.grid} ${u.gridCols1} ${u.gap4} ${u.smGridCols2} ${u.xlGridCols4}`}>
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

              <div class={`${u.grid} ${u.gridCols1} ${u.gap4} ${u.xlGridCols3}`}>
                {/* 快捷入口 + 访问趋势 */}
                <div class={`${u.appCard} ${u.p5} ${u.xlColSpan2}`}>
                  <div class={`${u.flex} ${u.itemsCenter} ${u.justifyBetween}`}>
                    <h3 class={`${u.textBase} ${u.fontSemibold}`}>快捷入口</h3>
                    <span class={`${u.textSm} ${u.textTextTertiary}`}>常用功能一键直达</span>
                  </div>
                  <div class={`${u.mt4} ${u.grid} ${u.gridCols1} ${u.gap3} ${u.smGridCols3}`}>
                    {SHORTCUTS.map((item) => (
                      <router-link
                        key={item.path}
                        to={item.path}
                        class={`${u.group} ${u.shortcutCard}`}
                      >
                        <div class={u.minW0}>
                          <div class={`${u.truncate} ${u.textBase} ${u.fontMedium}`}>
                            {item.title}
                          </div>
                          <div class={`${u.mt0_5} ${u.truncate} ${u.textSm} ${u.textTextTertiary}`}>
                            {item.desc}
                          </div>
                        </div>
                        <ElIcon class={s.arrowIcon}>
                          <Right />
                        </ElIcon>
                      </router-link>
                    ))}
                  </div>

                  <div class={s.trendHeader}>
                    <h3 class={`${u.textBase} ${u.fontSemibold}`}>访问趋势</h3>
                    <div class={s.trendLegend}>
                      <span class={s.trendLegendItem}>
                        <ElIcon class={u.trendUp}>
                          <Top />
                        </ElIcon>
                        上涨 12.4%
                      </span>
                      <span class={s.trendLegendItem}>
                        <ElIcon class={u.trendDown}>
                          <Bottom />
                        </ElIcon>
                        下跌 3.2%
                      </span>
                    </div>
                  </div>
                  <div class={s.barRow}>
                    {[38, 52, 44, 66, 58, 74, 62, 88, 70, 96, 82, 100].map((h, i) => (
                      <div key={i} class={u.trendBar} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* 最近动态 */}
                <div class={`${u.appCard} ${u.p5}`}>
                  <h3 class={`${u.textBase} ${u.fontSemibold}`}>最近动态</h3>
                  <ul class={s.activityList}>
                    {ACTIVITIES.map((item) => (
                      <li key={item.target} class={s.activityItem}>
                        <span class={u.activityDot} />
                        <div class={u.minW0}>
                          <div class={u.textSm}>
                            <span class={u.fontMedium}>{item.user}</span>
                            <span class={u.textTextSecondary}> {item.action} </span>
                            <span class={u.textPrimary}>{item.target}</span>
                          </div>
                          <div class={`${u.mt0_5} ${u.textSm} ${u.textTextQuaternary}`}>
                            <ElIcon size={12} class={u.mr1}>
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
