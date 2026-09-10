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

const ICON_BUTTON =
  'flex size-8 cursor-pointer items-center justify-center rounded-antd text-text-secondary transition-colors hover:bg-fill-tertiary hover:text-text'

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
     * 叶子 → `<ElMenuItem>`；分组 → `<ElSubMenu>`。
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
      <div class="flex h-full min-h-screen bg-layout">
        {/* ============ 侧边栏 ============ */}
        <aside
          class={[
            'flex shrink-0 flex-col border-r border-border-secondary bg-container transition-[width] duration-200',
            appStore.collapsed ? 'w-16' : 'w-56',
          ]}
        >
          <div class="flex h-14 shrink-0 items-center gap-2 border-b border-border-secondary px-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-antd bg-primary text-base font-bold text-white">
              V
            </div>
            {appStore.collapsed ? null : (
              <span class="truncate text-base font-semibold">Vue Antd</span>
            )}
          </div>

          <ElMenu
            class="flex-1 overflow-y-auto"
            defaultActive={route.path}
            collapse={appStore.collapsed}
            collapseTransition={false}
            router
          >
            {menuItems.value.map((item) => renderMenuItem(item))}
          </ElMenu>
        </aside>

        {/* ============ 主区域 ============ */}
        <div class="flex min-w-0 flex-1 flex-col">
          <header class="flex h-14 shrink-0 items-center gap-3 border-b border-border-secondary bg-container px-4">
            <button
              type="button"
              class={ICON_BUTTON}
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

            <div class="flex-1" />

            <ElTooltip content={appStore.dark ? '切换到亮色模式' : '切换到暗色模式'}>
              <button type="button" class={ICON_BUTTON} onClick={appStore.toggleDark}>
                {appStore.dark ? <Sunny /> : <Moon />}
              </button>
            </ElTooltip>

            <ElBadge isDot>
              <button type="button" class={ICON_BUTTON} aria-label="通知">
                <Bell />
              </button>
            </ElBadge>

            <ElDropdown onCommand={handleCommand}>
              {{
                default: () => (
                  <div class="flex cursor-pointer items-center gap-2 rounded-antd px-2 py-1 transition-colors hover:bg-fill-tertiary">
                    <ElAvatar size={28} class="bg-primary text-white">
                      {userStore.initials}
                    </ElAvatar>
                    <span class="text-base">{userStore.info.name}</span>
                    <ElIcon size={12} class="text-text-tertiary">
                      <ArrowDown />
                    </ElIcon>
                  </div>
                ),
                dropdown: () => (
                  <ElDropdownMenu>
                    <ElDropdownItem command="settings">
                      <ElIcon class="mr-1">
                        <SettingIcon />
                      </ElIcon>
                      个人设置
                    </ElDropdownItem>
                    <ElDropdownItem command="logout" divided>
                      <ElIcon class="mr-1">
                        <SwitchButton />
                      </ElIcon>
                      退出登录
                    </ElDropdownItem>
                  </ElDropdownMenu>
                ),
              }}
            </ElDropdown>
          </header>

          <main class="min-h-0 flex-1 overflow-y-auto p-6">
            <RouterView />
          </main>

          <footer class="border-t border-border-secondary bg-container px-6 py-3 text-center text-sm text-text-tertiary">
            Vue 3.6 · TSX · Element Plus · Tailwind CSS —— 设计风格致敬 Ant Design
          </footer>
        </div>
      </div>
    )
  },
})
