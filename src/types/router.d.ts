import 'vue-router'
import type { Component } from 'vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** 菜单标题 / 面包屑标题 / document.title */
    title?: string
    /** 菜单图标（Element Plus 图标组件） */
    icon?: Component
    /** 是否在侧边菜单中隐藏 */
    hideInMenu?: boolean
    /** 菜单排序，值越小越靠前 */
    order?: number
  }
}

export {}
