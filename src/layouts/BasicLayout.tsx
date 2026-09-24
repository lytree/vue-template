import { computed, defineComponent, h } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  ElAvatar,
  ElBadge,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMenu,
  ElMenuItem,
  ElMessage,
  ElSubMenu,
  ElTooltip,
} from 'element-plus'
import {
  ArrowDown,
  Bell,
  Expand,
  Fold,
  Moon,
  Setting as SettingIcon,
  Sunny,
  SwitchButton,
} from '@element-plus/icons-vue'

import { buildMenu, type MenuItem } from './menu'
import { useAppStore, useUserStore } from '@/stores'
import * as u from '@/styles/utility.css'
import s from './BasicLayout.module.scss'

export default defineComponent({
  name: 'BasicLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const appStore = useAppStore()
    const userStore = useUserStore()

    const menuItems = computed(() => buildMenu(router.options.routes))

    const breadcrumbs = computed(() => {
      const list = route.matched
        .filter((item) => item.meta.title)
        .map((item) => ({ path: item.path, title: item.meta.title as string }))

      if (list[0]?.path !== '/dashboard') {
        list.unshift({ path: '/dashboard', title: '首页' })
      }
      return list
    })

    function handleCommand(command: string | number | object) {
      if (command === 'settings') {
        void router.push('/settings')
      } else if (command === 'logout') {
        userStore.reset()
        ElMessage.success('已退出登录（示例）')
      }
    }

    /**
     * 递归渲染菜单项：
     * 叶子 → <ElMenuItem>；分组 → <ElSubMenu>。
     * 注意 `title` 是具名插槽，在 TSX 里必须用对象字面量写法，不能直接塞子节点。
     */
    function renderMenuItem(item: MenuItem) {
      const children = item.children
      const Icon = item.icon
      const iconVNode = Icon ? <ElIcon>{h(Icon)}</ElIcon> : null

      if (children?.length) {
        return (
          <ElSubMenu index={item.key} key={item.key}>
            {{
              title: () => (
                <>
                  {iconVNode}
                  <span>{item.label}</span>
                </>
              ),
              default: () => children.map((child) => renderMenuItem(child)),
            }}
          </ElSubMenu>
        )
      }

      return (
        <ElMenuItem index={item.key} key={item.key}>
          {iconVNode}
          <span>{item.label}</span>
        </ElMenuItem>
      )
    }

    return () => (
      <div class={`${u.flex} ${u.hFull} ${u.minHScreen} ${u.bgLayout}`}>
        {/* ============ 侧边栏 ============ */}
        <aside
          class={[
            `${u.flex} ${u.shrink0} ${u.flexCol} ${u.borderR} ${u.bgContainer} ${u.transitionWidth}`,
            appStore.collapsed ? s.asideNarrow : s.asideWide,
          ]}
        >
          <div
            class={`${u.flex} ${u.h14} ${u.shrink0} ${u.itemsCenter} ${u.gap2} ${u.borderB} ${u.px4}`}
          >
            <div class={s.logoBlock}>V</div>
            {appStore.collapsed ? null : (
              <span class={`${u.truncate} ${u.textBase} ${u.fontSemibold}`}>Vue Antd</span>
            )}
          </div>

          <ElMenu
            class={`${u.flex1} ${u.overflowYAuto}`}
            defaultActive={route.path}
            collapse={appStore.collapsed}
            collapseTransition={false}
            router
          >
            {menuItems.value.map((item) => renderMenuItem(item))}
          </ElMenu>
        </aside>

        {/* ============ 主区域 ============ */}
        <div class={`${u.flex} ${u.minW0} ${u.flex1} ${u.flexCol}`}>
          <header
            class={`${u.flex} ${u.h14} ${u.shrink0} ${u.itemsCenter} ${u.gap3} ${u.borderB} ${u.bgContainer} ${u.px4}`}
          >
            <button
              type="button"
              class={u.iconButton}
              aria-label="切换侧边栏"
              onClick={appStore.toggleCollapsed}
            >
              {appStore.collapsed ? <Expand /> : <Fold />}
            </button>

            <ElBreadcrumb separator="/">
              {breadcrumbs.value.map((item) => (
                <ElBreadcrumbItem key={item.path}>{item.title}</ElBreadcrumbItem>
              ))}
            </ElBreadcrumb>

            <div class={u.flex1} />

            <ElTooltip content={appStore.dark ? '切换到亮色模式' : '切换到暗色模式'}>
              <button type="button" class={u.iconButton} onClick={appStore.toggleDark}>
                {appStore.dark ? <Sunny /> : <Moon />}
              </button>
            </ElTooltip>

            <ElBadge isDot>
              <button type="button" class={u.iconButton} aria-label="通知">
                <Bell />
              </button>
            </ElBadge>

            <ElDropdown onCommand={handleCommand}>
              {{
                default: () => (
                  <div class={u.userTrigger}>
                    <ElAvatar size={28} class={`${u.bgPrimary} ${u.textWhite}`}>
                      {userStore.initials}
                    </ElAvatar>
                    <span class={u.textBase}>{userStore.info.name}</span>
                    <ElIcon size={12} class={s.headerArrow}>
                      <ArrowDown />
                    </ElIcon>
                  </div>
                ),
                dropdown: () => (
                  <ElDropdownMenu>
                    <ElDropdownItem command="settings">
                      <ElIcon class={s.dropdownIcon}>
                        <SettingIcon />
                      </ElIcon>
                      个人设置
                    </ElDropdownItem>
                    <ElDropdownItem command="logout" divided>
                      <ElIcon class={s.dropdownIcon}>
                        <SwitchButton />
                      </ElIcon>
                      退出登录
                    </ElDropdownItem>
                  </ElDropdownMenu>
                ),
              }}
            </ElDropdown>
          </header>

          <main class={`${u.minH0} ${u.flex1} ${u.overflowYAuto} ${u.p6}`}>
            <RouterView />
          </main>

          <footer class={s.footerText}>
            Vue 3.6 · TSX · Element Plus · vanilla-extract —— 设计风格致敬 Ant Design
          </footer>
        </div>
      </div>
    )
  },
})
