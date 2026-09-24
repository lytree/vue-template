import { defineComponent, ref } from 'vue'
import {
  ElAnchor,
  ElAnchorLink,
  ElBacktop,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElMessage,
  ElPageHeader,
  ElStep,
  ElSteps,
  ElSubMenu,
  ElTabPane,
  ElTabs,
} from 'element-plus'
import { ArrowDown, Setting } from '@element-plus/icons-vue'


import PageContainer from '@/components/PageContainer'
import DemoBlock from '@/components/DemoBlock'
import * as u from '@/styles/utility'
import s from './navigation.module.scss'

const ANCHOR_SECTIONS = ['锚点一', '锚点二', '锚点三']


export default defineComponent({
  name: 'ComponentsNavigationPage',
  setup() {
    const tabActive = ref('first')
    const tabCardActive = ref('first')

    return () => (
      <PageContainer
        title="导航组件"
        subtitle="菜单、标签页、面包屑、步骤条等导航类组件。带具名插槽的组件（如 ElSubMenu、ElDropdown）必须用对象字面量写法。"
      >
        {{
          default: () => (
            <div class={u.stackCol}>
              <DemoBlock
                title="ElMenu / ElMenuItem / ElMenuItemGroup / ElSubMenu"
                desc="菜单；ElMenuItemGroup 分组，ElSubMenu 二级菜单的标题走 title 具名插槽。"
                block
              >
                <ElMenu defaultActive="1" class={s.menuBox}>
                  <ElMenuItem index="1">
                    <ElIcon>
                      <Setting />
                    </ElIcon>
                    <span>导航一</span>
                  </ElMenuItem>
                  <ElMenuItem index="2">
                    <ElIcon>
                      <Setting />
                    </ElIcon>
                    <span>导航二</span>
                  </ElMenuItem>
                  <ElMenuItemGroup title="分组标题">
                    <ElMenuItem index="3">
                      <span>分组项一</span>
                    </ElMenuItem>
                    <ElMenuItem index="4">
                      <span>分组项二</span>
                    </ElMenuItem>
                  </ElMenuItemGroup>
                  <ElSubMenu index="5">
                    {{
                      title: () => (
                        <>
                          <ElIcon>
                            <Setting />
                          </ElIcon>
                          <span>子菜单</span>
                        </>
                      ),
                      default: () => (
                        <>
                          <ElMenuItem index="5-1">
                            <span>子项一</span>
                          </ElMenuItem>
                          <ElMenuItem index="5-2">
                            <span>子项二</span>
                          </ElMenuItem>
                        </>
                      ),
                    }}
                  </ElSubMenu>
                </ElMenu>
              </DemoBlock>

              <DemoBlock
                title="ElTabs / ElTabPane"
                desc="标签页；modelValue 绑定激活项的 name，label 用属性或 label 具名插槽。"
                block
              >
                <div class={s.tabStack}>
                  <ElTabs
                    modelValue={tabActive.value}
                    onUpdate:modelValue={(value?: unknown) => (tabActive.value = String(value ?? ''))}
                    class={s.tabsBox}
                  >
                    <ElTabPane label="用户管理" name="first">
                      <div class={s.tabPaneText}>用户管理的内容面板。</div>
                    </ElTabPane>
                    <ElTabPane label="配置管理" name="second">
                      <div class={s.tabPaneText}>配置管理的内容面板。</div>
                    </ElTabPane>
                    <ElTabPane label="角色管理（禁用）" name="third" disabled>
                      <div class={s.tabPaneText}>禁用项不可切换。</div>
                    </ElTabPane>
                  </ElTabs>

                  <ElTabs
                    modelValue={tabCardActive.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (tabCardActive.value = String(value ?? ''))
                    }
                    type="border-card"
                    class={s.tabsBox}
                  >
                    <ElTabPane name="first">
                      {{
                        label: () => (
                          <span>
                            <ElIcon class={u.importantMr1}>
                              <Setting />
                            </ElIcon>
                            具名插槽标签
                          </span>
                        ),
                        default: () => (
                          <div class={s.tabPaneText}>
                            label 用对象字面量插槽，可放图标与自定义结构。
                          </div>
                        ),
                      }}
                    </ElTabPane>
                    <ElTabPane label="普通标签" name="second">
                      <div class={s.tabPaneText}>border-card 风格。</div>
                    </ElTabPane>
                  </ElTabs>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElBreadcrumb / ElBreadcrumbItem"
                desc="面包屑；separator 自定义分隔符，to 让某一级可点击跳转。"
                block
              >
                <div class={s.breadcrumbStack}>
                  <ElBreadcrumb separator="/">
                    <ElBreadcrumbItem to="/dashboard">首页</ElBreadcrumbItem>
                    <ElBreadcrumbItem>组件示例</ElBreadcrumbItem>
                    <ElBreadcrumbItem>导航组件</ElBreadcrumbItem>
                  </ElBreadcrumb>
                  <ElBreadcrumb separator=">">
                    <ElBreadcrumbItem to="/dashboard">首页</ElBreadcrumbItem>
                    <ElBreadcrumbItem>自定义分隔符</ElBreadcrumbItem>
                  </ElBreadcrumb>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElDropdown / ElDropdownMenu / ElDropdownItem"
                desc="下拉菜单；触发元素放 default 插槽，菜单放 dropdown 插槽，点击项通过 onCommand 回传 command。"
              >
                <ElDropdown
                  onCommand={(command: string | number | object) =>
                    ElMessage.success(`点击了 ${String(command)}`)
                  }
                >
                  {{
                    default: () => (
                      <ElButton>
                        下拉菜单
                        <ElIcon class={s.dropdownArrow}>
                          <ArrowDown />
                        </ElIcon>
                      </ElButton>
                    ),
                    dropdown: () => (
                      <ElDropdownMenu>
                        <ElDropdownItem command="a">选项 A</ElDropdownItem>
                        <ElDropdownItem command="b">选项 B</ElDropdownItem>
                        <ElDropdownItem command="c" divided>
                          选项 C（上方有分隔线）
                        </ElDropdownItem>
                        <ElDropdownItem command="d" disabled>
                          禁用项
                        </ElDropdownItem>
                      </ElDropdownMenu>
                    ),
                  }}
                </ElDropdown>
              </DemoBlock>

              <DemoBlock
                title="ElSteps / ElStep"
                desc="步骤条；active 指定当前步骤下标，status 可单独覆盖某一步的状态。"
                block
              >
                <div class={s.stepsStack}>
                  <ElSteps active={1} class={s.stepsBox}>
                    <ElStep title="已完成" description="创建项目模板" />
                    <ElStep title="进行中" description="补充组件示例" />
                    <ElStep title="待开始" description="接入后端接口" />
                  </ElSteps>
                  <ElSteps active={1} simple class={s.stepsBox}>
                    <ElStep title="已完成" />
                    <ElStep title="进行中" />
                    <ElStep title="待开始" />
                  </ElSteps>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElPageHeader"
                desc="页头；title / content 控制文案，onBack 处理返回。注意该组件在 Element Plus 中已标记废弃，新项目建议自行组合。"
                block
              >
                <ElPageHeader
                  title="页面标题"
                  content="这是一段页面描述"
                  onBack={() => ElMessage.info('点击了返回')}
                >
                  <div class={s.tabPaneText}>正文内容走默认插槽。</div>
                </ElPageHeader>
              </DemoBlock>

              <DemoBlock
                title="ElBacktop"
                desc="回到顶部；target 指定滚动容器，visibilityHeight 控制出现时机。"
                block
              >
                <div class={s.backtopScope}>
                  <div class={s.backtopList}>
                    {Array.from({ length: 20 }, (_, index) => (
                      <div key={index} class={s.backtopItem}>
                        滚动内容 {index + 1}
                      </div>
                    ))}
                  </div>
                  <ElBacktop target=".backtop-scope" visibilityHeight={80} />
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElAnchor / ElAnchorLink"
                desc="锚点导航；container 指定滚动容器，点击 ElAnchorLink 平滑滚动到对应 id。"
                block
              >
                <div class={s.anchorScope}>
                  <div class={s.anchorLayout}>
                    <div class={s.anchorMain}>
                      {ANCHOR_SECTIONS.map((label, index) => (
                        <div
                          key={label}
                          id={`nav-anchor-${index + 1}`}
                          class={s.anchorTarget}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                    <ElAnchor container=".anchor-scope" offset={12}>
                      {ANCHOR_SECTIONS.map((label, index) => (
                        <ElAnchorLink
                          key={label}
                          href={`#nav-anchor-${index + 1}`}
                          title={label}
                        />
                      ))}
                    </ElAnchor>
                  </div>
                </div>
              </DemoBlock>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})