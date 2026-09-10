import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export interface MenuItem {
  key: string
  label: string
  icon?: Component
  order: number
  /** 有子项时渲染为 <ElSubMenu>，否则渲染为 <ElMenuItem> */
  children?: MenuItem[]
}

function resolvePath(base: string, path: string): string {
  if (path.startsWith('/')) return path
  const joined = `${base}/${path}`
  return joined.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
}

function sortByOrder(items: MenuItem[]): MenuItem[] {
  return items.sort((a, b) => a.order - b.order)
}

/**
 * 由路由表推导**菜单树**：
 *
 * - 只收集「有 meta.title、未被 hideInMenu 标记、路径不含动态参数」的路由。
 * - 带 `children` 且**自身有 title** 的路由 → 生成分组节点（渲染为 `<ElSubMenu>`）。
 *   没有 title 的容器路由（如根路由 `/`）→ 其子项直接上浮到当前层级。
 * - 叶子路由要求有 `component`，且不能是纯 `redirect`。
 */
export function buildMenu(records: readonly RouteRecordRaw[]): MenuItem[] {
  const walk = (list: readonly RouteRecordRaw[], base: string): MenuItem[] => {
    const items: MenuItem[] = []

    for (const record of list) {
      if (record.meta?.hideInMenu) continue
      // 跳过动态路由（如 /:pathMatch(.*)*）
      if (record.path.includes(':')) continue

      const fullPath = resolvePath(base, record.path)

      // 1) 有子路由
      if (record.children?.length) {
        const children = walk(record.children, fullPath)
        if (!children.length) continue

        // 容器路由（无 title）：子项上浮，保持原有扁平菜单行为
        if (!record.meta?.title) {
          items.push(...children)
          continue
        }

        items.push({
          key: fullPath,
          label: record.meta.title,
          icon: record.meta.icon,
          order: record.meta.order ?? 99,
          children: sortByOrder(children),
        })
        continue
      }

      // 2) 叶子路由
      if (!record.meta?.title || record.redirect || !record.component) continue

      items.push({
        key: fullPath,
        label: record.meta.title,
        icon: record.meta.icon,
        order: record.meta.order ?? 99,
      })
    }

    return items
  }

  return sortByOrder(walk(records, ''))
}
