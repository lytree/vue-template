/**
 * 主题切换的运行时 helper —— 桥接 Pinia store 与 vanilla-extract 主题系统
 *
 * 用法：
 *   // stores/modules/app.ts
 *   import { setTheme, themeOptions } from '@/styles/useTheme'
 *   import { defineStore } from 'pinia'
 *
 *   export const useAppStore = defineStore('app', {
 *     state: () => ({
 *       themeName: 'light' as ThemeName,  // 'light' | 'dark' | 'brand' | 'accent'
 *     }),
 *     actions: {
 *       toggleTheme() {
 *         this.themeName = this.themeName === 'light' ? 'dark' : 'light'
 *         setTheme(this.themeName)
 *       },
 *     },
 *   })
 *
 *   // main.tsx
 *   import { useAppStore } from '@/stores/modules/app'
 *   const app = useAppStore()
 *   setTheme(app.themeName) // 应用初始主题
 *
 *   // TSX 组件
 *   import { useTheme } from '@/styles/useTheme'
 *   const { theme, themeName, setTheme } = useTheme()
 *   <button onClick={() => setTheme('dark')}>切换暗色</button>
 *   <section class={theme}>{themeContract.color} 是当前主色</section>
 */
import { computed, ref } from 'vue'
import {
  themes,
  themeTransitioning,
  themeFlash,
  themeFadePulse,
  type ThemeName,
} from './utility.css'

/** 主题选项列表 —— 业务层遍历得到所有可选主题 */
export const themeOptions: ReadonlyArray<{
  name: ThemeName
  label: string
  description: string
}> = [
  { name: 'light', label: '亮色', description: '默认亮色调色板，适合日常使用' },
  { name: 'dark', label: '暗色', description: '暗色调色板，适合夜间或低光环境' },
  { name: 'brand', label: '品牌', description: '渐变紫色，适合营销页面' },
  { name: 'accent', label: '强调', description: '紫红色，适合演示或内嵌卡片' },
]

/**
 * 全局主题状态（跨组件响应式） —— Vue 单例 ref
 */
const currentTheme = ref<ThemeName>('light')

/** 主题过渡持续时间（ms） —— 主题切换时让 CSS 变量走这个时长 */
const THEME_TRANSITION_MS = 350

/** setTheme 的可选项 */
export interface SetThemeOptions {
  /** 是否启用过渡（默认 true） */
  animate?: boolean
  /** 自定义过渡时长（ms），覆盖默认 350 */
  duration?: number
  /** 自定义缓动函数 */
  easing?: string
  /** 是否触发 @view-transition 整页淡入淡出（Chrome 111+；默认 false） */
  viewTransition?: boolean
  /** 是否在 body 上加 themeFadePulse 轻量淡入（默认 true） */
  pulse?: boolean
}

/**
 * `setTheme(name, opts?)` —— 切换全局主题（带过渡动画）。
 *
 * 实现步骤（按顺序）：
 *   1. 可选：用 `document.startViewTransition` 包裹整页切换（@view-transition API）
 *   2. 在 `<html>` 上挂 `themeTransitioning` className（启用 --theme-transition）
 *   3. 在 `<body>` 上挂 `themeFadePulse` —— 200ms 轻量淡入
 *   4. 切换主题 className
 *   5. 时长到了清理 className
 *
 * 同时联动项目已有的「html.dark」机制（避免冲突）：
 *   • light / brand / accent  → 移除 .dark class
 *   • dark                     → 创建新的 .dark class
 */
export function setTheme(name: ThemeName, opts: SetThemeOptions = {}): void {
  const {
    animate = true,
    duration = THEME_TRANSITION_MS,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    viewTransition = false,
    pulse = true,
  } = opts
  currentTheme.value = name
  if (typeof document === 'undefined') return
  const root = document.documentElement

  /** 实际切换动作 —— 可被 viewTransition API 包裹 */
  const apply = () => {
    if (animate) {
      // 临时覆盖 CSS 变量（如果传了自定义 duration / easing）
      if (duration !== THEME_TRANSITION_MS || easing !== 'cubic-bezier(0.4, 0, 0.2, 1)') {
        root.style.setProperty('--theme-transition-duration', `${duration}ms`)
        root.style.setProperty('--theme-transition-easing', easing)
      }
      root.classList.add(themeTransitioning)

      // body 上挂 themeFadePulse —— 触发淡入动画
      if (pulse) {
        const body = document.body
        if (body) {
          body.classList.add(themeFadePulse)
          // 动画结束后移除（避免动画只触发一次）
          window.setTimeout(() => body.classList.remove(themeFadePulse), 250)
        }
      }

      // 过渡结束后清理
      window.setTimeout(() => {
        root.classList.remove(themeTransitioning)
        // 清除内联 var 覆盖（恢复 CSS 文件中定义的默认值）
        root.style.removeProperty('--theme-transition-duration')
        root.style.removeProperty('--theme-transition-easing')
      }, duration + 50)
    } else {
      // 立即切换：先取消过渡
      root.classList.remove(themeTransitioning)
    }

    applyThemeClass(root, name)
  }

  // 可选：用浏览器原生 @view-transition 包裹
  if (viewTransition && typeof (document as { startViewTransition?: unknown }).startViewTransition === 'function') {
    ;(document as Document & {
      startViewTransition?: (cb: () => void) => unknown
    }).startViewTransition?.(apply)
    return
  }

  apply()
}

/** 把主题 className 实际挂到 <html> 上（清掉旧主题 + 应用新主题） */
function applyThemeClass(root: HTMLElement, name: ThemeName): void {
  root.classList.remove(themes.light, themes.dark, themes.brand, themes.accent)
  if (name !== 'light') root.classList.add(themes[name])
  if (name === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

/**
 * `triggerThemeFlash()` —— 在主题切换的瞬间，让整页闪一下半透明黑。
 * 用于「让用户明确感知切了」的场景（默认关闭）。
 *
 * 用法：
 *   <button onClick={() => { setTheme('dark'); triggerThemeFlash() }}>切换</button>
 */
export function triggerThemeFlash(durationMs = 200): void {
  if (typeof document === 'undefined') return
  const body = document.body
  if (!body) return
  body.classList.add(themeFlash)
  window.setTimeout(() => body.classList.remove(themeFlash), durationMs)
}

/**
 * `getTheme()` —— 同步读取当前主题（仅在 setup 之外有用，组件内请用 useTheme）
 */
export function getTheme(): ThemeName {
  return currentTheme.value
}

/**
 * `useTheme()` —— 在 Vue setup 中使用，返回响应式主题状态。
 *
 * 返回：
 *   • theme       —— 当前主题的 className（class={theme}）
 *   • themeName   —— 响应式主题名（computed）
 *   • setTheme    —— 切换主题的方法
 *   • isDark      —— 是否为暗色模式
 *   • toggleTheme —— 在 light / dark 之间切换
 */
export function useTheme() {
  const themeName = computed(() => currentTheme.value)
  const theme = computed(() => themes[currentTheme.value])
  const isDark = computed(() => currentTheme.value === 'dark')
  return {
    themeName,
    theme,
    isDark,
    setTheme,
    toggleTheme: () => setTheme(isDark.value ? 'light' : 'dark'),
  }
}

/** 兜底：把主题初始化到 light（避免 SSR / 测试环境报错） */
export function initTheme(initial: ThemeName = 'light'): void {
  setTheme(initial)
}