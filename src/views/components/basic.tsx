import { defineComponent, h } from 'vue'
import {
  ElAffix,
  ElAside,
  ElButton,
  ElButtonGroup,
  ElCol,
  ElConfigProvider,
  ElContainer,
  ElDivider,
  ElFooter,
  ElHeader,
  ElIcon,
  ElLink,
  ElMain,
  ElRow,
  ElScrollbar,
  ElSpace,
  ElSplitter,
  ElSplitterPanel,
  ElText,
  ElWatermark,
} from 'element-plus'
import { Delete, Edit, Plus, Search, Star } from '@element-plus/icons-vue'

import PageContainer from '@/components/PageContainer'
import DemoBlock from '@/components/DemoBlock'

const CELL = 'flex h-12 items-center justify-center rounded-antd bg-fill-tertiary text-sm'

export default defineComponent({
  name: 'ComponentsBasicPage',
  setup() {
    return () => (
      <PageContainer
        title="基础组件"
        subtitle="按钮、图标、排版、布局容器等基础件在 TSX 中的调用方式。布尔属性可直接写裸属性（等价于 ={true}）。"
      >
        {{
          default: () => (
            <div class="flex flex-col gap-4">
              <DemoBlock
                title="ElButton"
                desc="type 控制语义色，size 控制尺寸，plain / round / link / text 控制形态。"
              >
                <ElButton>默认</ElButton>
                <ElButton type="primary">主要</ElButton>
                <ElButton type="success">成功</ElButton>
                <ElButton type="warning">警告</ElButton>
                <ElButton type="danger">危险</ElButton>
                <ElButton type="info">信息</ElButton>
                <ElButton plain>朴素</ElButton>
                <ElButton round>圆角</ElButton>
                <ElButton loading>加载中</ElButton>
                <ElButton disabled>禁用</ElButton>
                <ElButton link type="primary">
                  链接按钮
                </ElButton>
                <ElButton text>文字按钮</ElButton>
                <ElButton type="primary" size="large">
                  大号
                </ElButton>
                <ElButton type="primary" size="small">
                  小号
                </ElButton>
              </DemoBlock>

              <DemoBlock title="ElButtonGroup" desc="把一组按钮合并为整体，去掉相邻圆角。">
                <ElButtonGroup>
                  <ElButton type="primary">上一页</ElButton>
                  <ElButton type="primary">下一页</ElButton>
                </ElButtonGroup>
                <ElButtonGroup>
                  <ElButton plain>左</ElButton>
                  <ElButton plain>中</ElButton>
                  <ElButton plain>右</ElButton>
                </ElButtonGroup>
              </DemoBlock>

              <DemoBlock
                title="ElIcon"
                desc="图标来自 @element-plus/icons-vue，通过 size / color 调整，也可用 class 走设计令牌。"
              >
                <ElIcon>
                  <Search />
                </ElIcon>
                <ElIcon size={24}>
                  <Edit />
                </ElIcon>
                <ElIcon size={24} color="#1677ff">
                  <Star />
                </ElIcon>
                <ElIcon size={24} class="text-error">
                  <Delete />
                </ElIcon>
              </DemoBlock>

              <DemoBlock
                title="ElIcon · 动态图标"
                desc="图标变量统一用 h(icon) 渲染，避免在 JSX 里直接写 <Icon /> 带来的类型问题。"
              >
                {[Plus, Search, Star].map((icon, index) => (
                  <ElIcon key={index} size={22} class="text-primary">
                    {h(icon)}
                  </ElIcon>
                ))}
              </DemoBlock>

              <DemoBlock title="ElLink" desc="超链接文本；icon 属性可直接传图标组件。">
                <ElLink href="https://element-plus.org" target="_blank">
                  默认链接
                </ElLink>
                <ElLink type="primary">主要链接</ElLink>
                <ElLink type="success">成功链接</ElLink>
                <ElLink type="warning">警告链接</ElLink>
                <ElLink type="danger">危险链接</ElLink>
                <ElLink type="info" disabled>
                  禁用链接
                </ElLink>
                <ElLink type="primary" icon={Edit}>
                  带图标
                </ElLink>
              </DemoBlock>

              <DemoBlock title="ElText" desc="带语义色与字号的文本，bold / truncated 等布尔属性直接写裸属性。">
                <ElText>默认文本</ElText>
                <ElText type="primary">主要</ElText>
                <ElText type="success">成功</ElText>
                <ElText type="warning">警告</ElText>
                <ElText type="danger">危险</ElText>
                <ElText type="info">信息</ElText>
                <ElText size="large">大号</ElText>
                <ElText size="small">小号</ElText>
                <ElText tag="strong" style={{ fontWeight: 600 }}>
                  加粗
                </ElText>
                <ElText truncated style={{ width: '150px' }}>
                  这段超长文本会被截断并显示省略号
                </ElText>
              </DemoBlock>

              <DemoBlock title="ElRow / ElCol" desc="24 栅格布局，gutter 控制列间距。" block>
                <ElRow gutter={12}>
                  <ElCol span={24}>
                    <div class={CELL}>span=24</div>
                  </ElCol>
                </ElRow>
                <ElRow gutter={12} class="mt-3">
                  <ElCol span={12}>
                    <div class={CELL}>span=12</div>
                  </ElCol>
                  <ElCol span={12}>
                    <div class={CELL}>span=12</div>
                  </ElCol>
                </ElRow>
                <ElRow gutter={12} class="mt-3">
                  <ElCol span={6}>
                    <div class={CELL}>6</div>
                  </ElCol>
                  <ElCol span={6}>
                    <div class={CELL}>6</div>
                  </ElCol>
                  <ElCol span={6}>
                    <div class={CELL}>6</div>
                  </ElCol>
                  <ElCol span={6}>
                    <div class={CELL}>6</div>
                  </ElCol>
                </ElRow>
              </DemoBlock>

              <DemoBlock
                title="ElContainer 系列"
                desc="ElContainer / ElHeader / ElAside / ElMain / ElFooter 会根据子组件自动推断排列方向。"
                block
              >
                <ElContainer class="h-44 overflow-hidden rounded-antd border border-border-secondary">
                  <ElHeader class="bg-fill-tertiary text-center text-sm leading-[60px]">
                    ElHeader
                  </ElHeader>
                  <ElContainer>
                    <ElAside width="120px" class="bg-fill-secondary text-center text-sm leading-[116px]">
                      ElAside
                    </ElAside>
                    <ElMain class="text-center text-sm">ElMain</ElMain>
                  </ElContainer>
                  <ElFooter class="bg-fill-tertiary text-center text-sm leading-[60px]">
                    ElFooter
                  </ElFooter>
                </ElContainer>
              </DemoBlock>

              <DemoBlock title="ElSpace" desc="统一控制子元素间距，支持水平 / 垂直与自动换行。">
                <ElSpace size={16} wrap>
                  <ElButton plain>按钮 A</ElButton>
                  <ElButton plain>按钮 B</ElButton>
                  <ElButton plain>按钮 C</ElButton>
                </ElSpace>
                <ElSpace direction="vertical" size={8} alignment="flex-start">
                  <div class={CELL + ' w-40'}>垂直 1</div>
                  <div class={CELL + ' w-40'}>垂直 2</div>
                </ElSpace>
              </DemoBlock>

              <DemoBlock title="ElDivider" desc="水平 / 垂直分割线，水平模式可带文字内容。" block>
                <div class="flex items-center gap-3 text-sm">
                  <span>左侧</span>
                  <ElDivider direction="vertical" />
                  <span>中间</span>
                  <ElDivider direction="vertical" />
                  <span>右侧</span>
                </div>
                <ElDivider class="!my-5" contentPosition="left">
                  分组标题
                </ElDivider>
                <ElDivider class="!my-5">居中标题</ElDivider>
              </DemoBlock>

              <DemoBlock
                title="ElSplitter / ElSplitterPanel"
                desc="可拖动分栏容器，支持水平与垂直切分。"
                block
              >
                <ElSplitter style={{ height: '160px' }} class="rounded-antd border border-border-secondary">
                  <ElSplitterPanel>
                    <div class="flex h-full items-center justify-center bg-fill-tertiary text-sm">
                      面板 A
                    </div>
                  </ElSplitterPanel>
                  <ElSplitterPanel>
                    <div class="flex h-full items-center justify-center bg-fill-quaternary text-sm">
                      面板 B
                    </div>
                  </ElSplitterPanel>
                </ElSplitter>
              </DemoBlock>

              <DemoBlock
                title="ElScrollbar"
                desc="自定义滚动条容器；用 height / maxHeight 限定可视高度。"
                block
              >
                <ElScrollbar height="140px" class="w-full max-w-72 rounded-antd border border-border-secondary p-3">
                  <div class="flex flex-col gap-2 text-sm">
                    {Array.from({ length: 16 }, (_, index) => (
                      <div key={index} class="rounded-antd-sm bg-fill-quaternary px-3 py-1.5">
                        列表项 {index + 1}
                      </div>
                    ))}
                  </div>
                </ElScrollbar>
              </DemoBlock>

              <DemoBlock
                title="ElWatermark"
                desc="在包裹的内容上叠加文字或图片水印。"
                block
              >
                <ElWatermark content="Vue Antd Template">
                  <div class="h-32 rounded-antd border border-border-secondary p-4 text-sm text-text-secondary">
                    水印会铺在这块内容之上，用于标识文档来源。
                  </div>
                </ElWatermark>
              </DemoBlock>

              <DemoBlock
                title="ElAffix"
                desc="把元素固定在滚动容器指定位置。本页滚动容器是 layout 的 <main>，需配合 target 才能在容器内固定。"
                block
              >
                <div class="h-40 overflow-y-auto rounded-antd border border-border-secondary">
                  <ElAffix offset={0} target=".affix-scope">
                    <div class="affix-scope w-full bg-primary px-3 py-2 text-center text-sm text-white">
                      固定在容器顶部（target=".affix-scope"）
                    </div>
                  </ElAffix>
                  <div class="flex flex-col gap-2 p-3 text-sm">
                    {Array.from({ length: 12 }, (_, index) => (
                      <div key={index} class="rounded-antd-sm bg-fill-quaternary px-3 py-1.5">
                        滚动内容 {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElConfigProvider"
                desc="全局配置容器：包裹子树即可统一注入尺寸、语言包、命名空间等，无需逐个组件传参。"
                block
              >
                <div class="flex flex-col gap-4">
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="w-36 shrink-0 text-sm text-text-tertiary">默认尺寸</span>
                    <ElButton type="primary">按钮</ElButton>
                    <ElButton>按钮</ElButton>
                  </div>
                  <ElConfigProvider size="small">
                    <div class="flex flex-wrap items-center gap-3">
                      <span class="w-36 shrink-0 text-sm text-text-tertiary">
                        size="small" 包裹后
                      </span>
                      <ElButton type="primary">按钮</ElButton>
                      <ElButton>按钮</ElButton>
                    </div>
                  </ElConfigProvider>
                </div>
              </DemoBlock>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
