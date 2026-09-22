import { defineComponent, ref } from 'vue'
import {
  ElAutoResizer,
  ElAvatar,
  ElAvatarGroup,
  ElBadge,
  ElButton,
  ElCalendar,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElCollapse,
  ElCollapseItem,
  ElCountdown,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElImage,
  ElImageViewer,
  ElPagination,
  ElProgress,
  ElSkeleton,
  ElSkeletonItem,
  ElStatistic,
  ElTable,
  ElTableColumn,
  ElTableV2,
  ElTag,
  ElTimeline,
  ElTimelineItem,
  ElTree,
  ElTreeV2,
} from 'element-plus'

import PageContainer from '@/components/PageContainer'
import DemoBlock from '@/components/DemoBlock'
import * as u from '@/styles/utility.css'
import * as s from './data.css'

interface Row {
  id: number
  name: string
  email: string
  score: number
}

const ROWS: Row[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  name: `成员 ${index + 1}`,
  email: `user${index + 1}@example.com`,
  score: 60 + index * 5,
}))

const V2_COLUMNS = [
  { key: 'id', dataKey: 'id', title: '编号', width: 90 },
  { key: 'name', dataKey: 'name', title: '姓名', width: 140 },
  { key: 'email', dataKey: 'email', title: '邮箱', width: 220 },
  { key: 'score', dataKey: 'score', title: '评分', width: 100 },
]

const V2_ROWS = Array.from({ length: 200 }, (_, index) => ({
  id: index + 1,
  name: `成员 ${index + 1}`,
  email: `user${index + 1}@example.com`,
  score: 60 + (index % 40),
}))

const TREE_OPTIONS = [
  {
    id: '1',
    label: '一级 1',
    children: [
      { id: '1-1', label: '二级 1-1' },
      { id: '1-2', label: '二级 1-2' },
    ],
  },
  {
    id: '2',
    label: '一级 2',
    children: [{ id: '2-1', label: '二级 2-1' }],
  },
]

const TREE_V2_DATA = Array.from({ length: 200 }, (_, index) => ({
  id: index + 1,
  label: `节点 ${index + 1}`,
}))

const IMG_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">' +
      '<rect width="320" height="180" fill="#1677ff"/>' +
      '<text x="160" y="98" font-size="20" fill="#ffffff" text-anchor="middle">Element Plus Image</text>' +
      '</svg>',
  )

export default defineComponent({
  name: 'ComponentsDataPage',
  setup() {
    const page = ref(1)
    const pageSize = ref(10)
    const viewerVisible = ref(false)
    const activeNames = ref<string[]>(['1'])
    const calendarDate = ref(new Date())
    const treeChecked = ref<string[]>(['1-1'])
    const countdownTarget = Date.now() + 1000 * 60 * 60 * 26 + 1000 * 61

    return () => (
      <PageContainer
        title="数据展示"
        subtitle="表格、树、分页、标签等数据类组件的 TSX 调用。表格的自定义列要用对象字面量写作用域插槽。"
      >
        {{
          default: () => (
            <div class={u.stackCol}>
              <DemoBlock
                title="ElTable / ElTableColumn"
                desc="data 传数组；普通列用 prop，自定义列用作用域插槽（回调参数需显式标注类型）。"
                block
              >
                <ElTable data={ROWS} rowKey="id" border class={u.importantWFull}>
                  <ElTableColumn prop="id" label="编号" width="90" />
                  <ElTableColumn prop="name" label="姓名" width="120" />
                  <ElTableColumn prop="email" label="邮箱" minWidth="200" />
                  <ElTableColumn label="评分" width="120">
                    {{
                      default: ({ row }: { row: unknown }) => {
                        const item = row as Row
                        return (
                          <ElTag type={item.score >= 75 ? 'success' : 'warning'} effect="light">
                            {item.score}
                          </ElTag>
                        )
                      },
                    }}
                  </ElTableColumn>
                </ElTable>
              </DemoBlock>

              <DemoBlock
                title="ElTableV2 / ElAutoResizer"
                desc="虚拟滚动表格，200 行只渲染可视区域；用 ElAutoResizer 的作用域插槽拿到宽高。"
                block
              >
                <div style={{ height: '260px' }}>
                  <ElAutoResizer>
                    {{
                      default: ({ height, width }: { height: number; width: number }) => (
                        <ElTableV2
                          columns={V2_COLUMNS}
                          data={V2_ROWS}
                          width={width}
                          height={height}
                          rowHeight={36}
                        />
                      ),
                    }}
                  </ElAutoResizer>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElPagination"
                desc="分页。务必用 onUpdate:current-page / onUpdate:page-size —— 写成 onCurrent-change 会被 Element Plus 判定为废弃用法并整块不渲染。"
                block
              >
                <ElPagination
                  currentPage={page.value}
                  pageSize={pageSize.value}
                  total={86}
                  pageSizes={[10, 20, 50]}
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                  onUpdate:current-page={(value?: number) => (page.value = value ?? 1)}
                  onUpdate:page-size={(value?: number) => {
                    pageSize.value = value ?? 10
                    page.value = 1
                  }}
                />
              </DemoBlock>

              <DemoBlock title="ElTag" desc="标签；effect 控制风格，closable 支持关闭。">
                <ElTag>默认</ElTag>
                <ElTag type="primary">主要</ElTag>
                <ElTag type="success">成功</ElTag>
                <ElTag type="warning">警告</ElTag>
                <ElTag type="danger">危险</ElTag>
                <ElTag type="info">信息</ElTag>
                <ElTag type="primary" effect="dark">
                  深色
                </ElTag>
                <ElTag type="success" effect="plain">
                  朴素
                </ElTag>
                <ElTag type="primary" round>
                  圆角
                </ElTag>
                <ElTag type="danger" closable>
                  可关闭
                </ElTag>
                <ElTag type="info" size="small">
                  小号
                </ElTag>
              </DemoBlock>

              <DemoBlock title="ElProgress" desc="进度条；type 支持 line / circle / dashboard。">
                <div class={s.progressWrap}>
                  <ElProgress percentage={68} />
                  <ElProgress percentage={100} status="success" />
                  <ElProgress percentage={42} status="warning" />
                  <ElProgress percentage={24} status="exception" />
                  <ElProgress percentage={75} strokeWidth={16} striped stripedFlow />
                </div>
                <div class={s.progressCircleRow}>
                  <ElProgress type="circle" percentage={72} />
                  <ElProgress type="dashboard" percentage={48} />
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElTree"
                desc="树形控件；nodeKey 指定唯一字段，defaultCheckedKeys 设默认勾选，作用域插槽自定义节点内容。"
                block
              >
                <ElTree
                  data={TREE_OPTIONS}
                  nodeKey="id"
                  defaultExpandAll
                  showCheckbox
                  defaultCheckedKeys={treeChecked.value}
                  onCheck={(data: unknown) =>
                    (treeChecked.value = (Array.isArray(data) ? data : [data]).map(String))
                  }
                  class={s.maxWmd}
                >
                  {{
                    default: ({ data }: { data: { label: string } }) => (
                      <span class={u.textSm}>{data.label}</span>
                    ),
                  }}
                </ElTree>
              </DemoBlock>

              <DemoBlock
                title="ElTreeV2"
                desc="虚拟滚动树，适合上千节点；必须给 height，itemSize 控制行高。"
                block
              >
                <div class={s.treeV2Box}>
                  <ElTreeV2 data={TREE_V2_DATA} height={220} itemSize={32} />
                </div>
              </DemoBlock>

              <DemoBlock title="ElBadge" desc="徽标；value 传数字，isDot 只显示小圆点。">
                <ElBadge value={12}>
                  <div class={s.badgeSlot}>消息</div>
                </ElBadge>
                <ElBadge value={200} max={99}>
                  <div class={s.badgeSlot}>上限</div>
                </ElBadge>
                <ElBadge isDot>
                  <div class={s.badgeSlot}>圆点</div>
                </ElBadge>
                <ElBadge value="new" type="primary">
                  <div class={s.badgeSlot}>文本</div>
                </ElBadge>
              </DemoBlock>

              <DemoBlock
                title="ElAvatar / ElAvatarGroup"
                desc="头像；src 传图片地址，icon 可传图标组件，ElAvatarGroup 用 max 限制折叠数量。"
              >
                <ElAvatar size={44} class={s.avatarPrimary}>
                  V
                </ElAvatar>
                <ElAvatar size={44} shape="square" class={s.avatarSuccess}>
                  A
                </ElAvatar>
                <ElAvatar size={44} src={IMG_SRC} />
                <ElAvatarGroup collapseAvatars maxCollapseAvatars={3}>
                  {['V', 'A', 'N', 'T'].map((text) => (
                    <ElAvatar key={text} class={s.avatarPrimary}>
                      {text}
                    </ElAvatar>
                  ))}
                </ElAvatarGroup>
              </DemoBlock>

              <DemoBlock
                title="ElSkeleton / ElSkeletonItem"
                desc="骨架屏；ElSkeleton 负责布局与动画，ElSkeletonItem 用 variant 指定占位形状。"
                block
              >
                <div class={s.skeletonRow}>
                  <ElSkeleton rows={3} animated />
                  <div class={s.skeletonInline}>
                    <ElSkeletonItem variant="circle" style={{ width: '48px', height: '48px' }} />
                    <div class={s.skeletonTextCol}>
                      <ElSkeletonItem variant="text" style={{ width: '40%' }} />
                      <ElSkeletonItem variant="text" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElCarousel / ElCarouselItem"
                desc="走马灯；height 固定可视高度，interval 控制切换间隔。"
              >
                <ElCarousel height="160px" interval={3500} class={s.carousel}>
                  {['#1677ff', '#52c41a', '#faad14'].map((bg, index) => (
                    <ElCarouselItem key={bg}>
                      <div class={s.carouselSlide} style={{ background: bg }}>
                        第 {index + 1} 屏
                      </div>
                    </ElCarouselItem>
                  ))}
                </ElCarousel>
              </DemoBlock>

              <DemoBlock
                title="ElDescriptions / ElDescriptionsItem"
                desc="描述列表；column 控制每行列数，border 开启边框。"
                block
              >
                <ElDescriptions title="账号信息" column={3} border>
                  <ElDescriptionsItem label="用户名">admin</ElDescriptionsItem>
                  <ElDescriptionsItem label="角色">管理员</ElDescriptionsItem>
                  <ElDescriptionsItem label="状态">
                    <ElTag type="success" effect="light">
                      正常
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="邮箱" span={3}>
                    admin@example.com
                  </ElDescriptionsItem>
                </ElDescriptions>
              </DemoBlock>

              <DemoBlock
                title="ElImage"
                desc="图片；previewSrcList 提供后点击即打开 ElImageViewer 大图预览，fit 控制填充方式。"
                block
              >
                <div class={s.imageGrid}>
                  <ElImage src={IMG_SRC} fit="cover" style={{ width: '160px', height: '90px' }} />
                  <ElImage
                    src={IMG_SRC}
                    previewSrcList={[IMG_SRC]}
                    fit="contain"
                    style={{ width: '160px', height: '90px' }}
                  />
                  <ElImage style={{ width: '160px', height: '90px' }}>
                    {{
                      error: () => <ElEmpty description="加载失败" imageSize={40} />,
                    }}
                  </ElImage>
                </div>
                <div class={u.mt4}>
                  <ElButton onClick={() => (viewerVisible.value = true)}>
                    手动调用 ElImageViewer
                  </ElButton>
                </div>
                {viewerVisible.value ? (
                  <ElImageViewer
                    urlList={[IMG_SRC]}
                    onClose={() => (viewerVisible.value = false)}
                  />
                ) : null}
              </DemoBlock>

              <DemoBlock
                title="ElStatistic"
                desc="统计数值；precision 控制小数位，前缀后缀用具名插槽。"
              >
                <ElStatistic title="活跃用户" value={128460} />
                <ElStatistic title="转化率" value={0.6824} precision={2} suffix="%" />
                <ElStatistic title="营收" value={9876543.21} precision={2}>
                  {{
                    prefix: () => <span class={u.textBase}>¥</span>,
                  }}
                </ElStatistic>
              </DemoBlock>

              <DemoBlock
                title="ElCountdown"
                desc="倒计时；value 传目标时间，format 用 DD / HH / mm / ss 占位。"
              >
                <ElCountdown value={countdownTarget} format="DD 天 HH:mm:ss" class={s.countdown} />
              </DemoBlock>

              <DemoBlock
                title="ElTimeline / ElTimelineItem"
                desc="时间线；type 控制节点样式，hollow 空心圆点。"
              >
                <ElTimeline class={s.maxWxl}>
                  <ElTimelineItem timestamp="2026-09-01" type="primary">
                    创建项目模板
                  </ElTimelineItem>
                  <ElTimelineItem timestamp="2026-09-05" type="success">
                    接入 Element Plus 与 vanilla-extract
                  </ElTimelineItem>
                  <ElTimelineItem timestamp="2026-09-10" color="#faad14" hollow>
                    完成组件示例补充
                  </ElTimelineItem>
                  <ElTimelineItem timestamp="待办">补充单元测试</ElTimelineItem>
                </ElTimeline>
              </DemoBlock>

              <DemoBlock
                title="ElCollapse / ElCollapseItem"
                desc="折叠面板；modelValue 是展开项 name 的数组，title 可作属性或具名插槽。"
                block
              >
                <ElCollapse
                  modelValue={activeNames.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (activeNames.value = (value ?? []) as string[])
                  }
                  class={s.maxWxl}
                >
                  <ElCollapseItem title="用 title 属性" name="1">
                    <div class={s.textSmSecondary}>
                      这是通过 title 属性传标题的写法，内容走默认插槽。
                    </div>
                  </ElCollapseItem>
                  <ElCollapseItem name="2">
                    {{
                      title: () => <span class={u.fontMedium}>用 title 具名插槽</span>,
                      default: () => (
                        <div class={s.textSmSecondary}>
                          需要自定义标题结构时改用 title 插槽。
                        </div>
                      ),
                    }}
                  </ElCollapseItem>
                </ElCollapse>
              </DemoBlock>

              <DemoBlock
                title="ElCard"
                desc="卡片；header 可作属性或具名插槽，shadow 控制阴影层级。"
              >
                <div class={s.cardRow}>
                  <ElCard header="属性标题" class={s.cardSmall}>
                    <div class={s.cardBody}>header 直接传字符串。</div>
                  </ElCard>
                  <ElCard shadow="hover" class={s.cardSmall}>
                    {{
                      header: () => <span class={s.cardHeader}>具名插槽标题</span>,
                      default: () => (
                        <div class={s.cardBody}>shadow="hover" 悬停有阴影。</div>
                      ),
                    }}
                  </ElCard>
                </div>
              </DemoBlock>

              <DemoBlock title="ElEmpty" desc="空状态；可替换 image 插槽放自定义插画。">
                <ElEmpty description="暂无数据" />
                <ElEmpty>
                  {{
                    description: () => <span class={u.textSm}>自定义描述插槽</span>,
                  }}
                </ElEmpty>
              </DemoBlock>

              <DemoBlock
                title="ElCalendar"
                desc="日历；modelValue 是 Date 类型，作用域插槽的 date 为 YYYY-MM-DD 字符串。"
                block
              >
                <ElCalendar
                  modelValue={calendarDate.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (calendarDate.value = (value as Date) ?? new Date())
                  }
                  class={s.calendarBox}
                >
                  {{
                    dateCell: ({ data }: { data: { day: string } }) => (
                      <div class={s.calendarDay}>{data.day.split('-')[2]}</div>
                    ),
                  }}
                </ElCalendar>
              </DemoBlock>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
