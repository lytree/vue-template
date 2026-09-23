import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { Brush, Collection, DataLine, EditPen, Grid, Setting } from '@element-plus/icons-vue'

import BasicLayout from '@/layouts/BasicLayout'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '工作台', icon: DataLine, order: 1 },
      },
      {
        path: 'list/table',
        name: 'TableList',
        component: () => import('@/views/list/table'),
        meta: { title: '查询表格', icon: Grid, order: 2 },
      },
      {
        path: 'form',
        name: 'BasicForm',
        component: () => import('@/views/form/basic'),
        meta: { title: '表单页', icon: EditPen, order: 3 },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index'),
        meta: { title: '系统设置', icon: Setting, order: 4 },
      },
      {
        // 分组路由：自身没有 component，子路由直接渲染进 BasicLayout 的 RouterView
        path: 'components',
        name: 'Components',
        redirect: '/components/basic',
        meta: { title: '组件示例', icon: Collection, order: 5 },
        children: [
          {
            path: 'basic',
            name: 'ComponentsBasic',
            component: () => import('@/views/components/basic'),
            meta: { title: '基础组件', order: 1 },
          },
          {
            path: 'form',
            name: 'ComponentsForm',
            component: () => import('@/views/components/form'),
            meta: { title: '表单组件', order: 2 },
          },
          {
            path: 'data',
            name: 'ComponentsData',
            component: () => import('@/views/components/data'),
            meta: { title: '数据展示', order: 3 },
          },
          {
            path: 'feedback',
            name: 'ComponentsFeedback',
            component: () => import('@/views/components/feedback'),
            meta: { title: '反馈组件', order: 4 },
          },
          {
            path: 'navigation',
            name: 'ComponentsNavigation',
            component: () => import('@/views/components/navigation'),
            meta: { title: '导航组件', order: 5 },
          },
          {
            path: 'theme',
            name: 'ComponentsTheme',
            component: () => import('@/views/theme/index'),
            meta: { title: '主题动画演示', icon: Brush, order: 6 },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/exception/404'),
    meta: { title: '页面不存在', hideInMenu: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} · Vue Antd Template` : 'Vue Antd Template'
})

export default router
