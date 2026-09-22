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
  themeAnimations,
  type ThemeName,
  type ThemeAnimationName,
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
  /** 切换瞬间的整页动画类型（默认 'fade'） */
  animation?: ThemeAnimationName | false
  /** 自定义过渡 class —— 传字符串覆盖默认 */
  bodyClass?: string
  /** 点击位置（用于 ripple/expand 动画）。默认屏幕中心 */
  originX?: number
  originY?: number
}

/**
 * setTheme(...) —— 切换全局主题，返回 Promise<ThemeName> 等动画完成。
 *
 * 实现步骤（按顺序）：
 *   1. 在 `<html>` 上挂 `themeTransitioning` className（启用 --theme-transition）
 *   2. 在 `<body>` 上挂 `themeAnimations[animation]` —— 整页动画
 *   3. 切换主题 className
 *   4. 时长到了清理 className + resolve()
 *
 * 同时联动项目已有的「html.dark」机制（避免冲突）：
 *   • light / brand / accent  → 移除 .dark class
 *   • dark                     → 创建新的 .dark class
 */
export function setTheme(name: ThemeName, opts: SetThemeOptions = {}): Promise<ThemeName> {
  const {
    animate = true,
    duration = THEME_TRANSITION_MS,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    viewTransition = false,
    animation = 'fade',
    bodyClass,
    originX,
    originY,
  } = opts
  currentTheme.value = name
  if (typeof document === 'undefined') return Promise.resolve(name)

  const root = document.documentElement
  const body = document.body

  /** 内部：实际切换动作（被 viewTransition 包裹或直接执行） */
  const apply = () => {
    if (animate) {
      // 临时覆盖 CSS 变量（如果传了自定义 duration / easing）
      if (duration !== THEME_TRANSITION_MS || easing !== 'cubic-bezier(0.4, 0, 0.2, 1)') {
        root.style.setProperty('--theme-transition-duration', `${duration}ms`)
        root.style.setProperty('--theme-transition-easing', easing)
      }
      root.classList.add(themeTransitioning)

      // body 上挂切换动画（默认 fadePulse）
      if (body) {
        const animClass = bodyClass ?? (animation && themeAnimations[animation])
        if (animClass) {
          body.classList.add(animClass)
          // 不同动画时长差异：取最长的覆盖时间
          const maxAnimMs = Math.max(duration, getAnimMaxDuration(animation))
          window.setTimeout(() => body.classList.remove(animClass), maxAnimMs + 50)
        }

        // 给 expand / ripple 动画设置点击位置
        if (originX !== undefined && originY !== undefined) {
          root.style.setProperty('--theme-ripple-x', `${originX}px`)
          root.style.setProperty('--theme-ripple-y', `${originY}px`)
        }
      }

      // 过渡结束后清理 + resolve
      window.setTimeout(() => {
        root.classList.remove(themeTransitioning)
        root.style.removeProperty('--theme-transition-duration')
        root.style.removeProperty('--theme-transition-easing')
        if (originX !== undefined) root.style.removeProperty('--theme-ripple-x')
        if (originY !== undefined) root.style.removeProperty('--theme-ripple-y')
        resolveThemeTransition(name)
      }, duration + 50)
    } else {
      root.classList.remove(themeTransitioning)
      resolveThemeTransition(name)
    }

    applyThemeClass(root, name)
  }

  return new Promise<ThemeName>((resolve) => {
    // 当前 setTheme 的 resolve 函数挂到全局
    pendingResolve = resolve

    // 可选：用浏览器原生 @view-transition 包裹
    if (
      viewTransition &&
      typeof (document as { startViewTransition?: unknown }).startViewTransition === 'function'
    ) {
      ;(document as Document & {
        startViewTransition?: (cb: () => void) => unknown
      }).startViewTransition?.(apply)
      return
    }

    apply()
  })
}

/** 同步立即切换（不返回 Promise 的 fire-and-forget 版本，给内部 useTheme 用） */
export function setThemeSync(name: ThemeName): void {
  currentTheme.value = name
  if (typeof document === 'undefined') return
  applyThemeClass(document.documentElement, name)
  if (name === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

/** 当前 setTheme 的 resolve 函数 —— setTheme 完成后调一次 */
let pendingResolve: ((value: ThemeName) => void) | null = null
function resolveThemeTransition(name: ThemeName): void {
  if (pendingResolve) {
    pendingResolve(name)
    pendingResolve = null
  }
}

/** 取动画最大时长（用于清理 timer） */
function getAnimMaxDuration(name: ThemeAnimationName | false): number {
  if (!name) return 0
  // 简单硬编码（与 utility.css.ts 里的 animationDuration 对齐）
  const map: Record<ThemeAnimationName, number> = {
    fade: 200,
    blur: 400,
    scale: 350,
    slide: 400,
    expand: 600,
    flash: 200,
    shimmer: 700,
    matrix: 500,
  }
  return map[name]
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
 * `beginThemeTransition(opts)` —— 不切换主题，只启动一次主题过渡动画。
 * 给路由切换 / 弹窗打开等场景用：手动让页面"主题过渡"一波，
 * 而不实际切主题。
 *
 * 用法：
 *   beginThemeTransition({ duration: 200 })
 *   // 200ms 后自动清理
 */
export function beginThemeTransition(opts: { duration?: number } = {}): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const { duration = THEME_TRANSITION_MS } = opts
  root.style.setProperty('--theme-transition-duration', `${duration}ms`)
  root.classList.add(themeTransitioning)
  window.setTimeout(() => {
    root.classList.remove(themeTransitioning)
    root.style.removeProperty('--theme-transition-duration')
  }, duration + 50)
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
 *   • theme        —— 当前主题的 className（class={theme}）
 *   • themeName    —— 响应式主题名（computed）
 *   • setTheme     —— 切换主题（返回 Promise<ThemeName>）
 *   • isDark       —— 是否为暗色模式
 *   • toggleTheme  —— 在 light / dark 之间切换（返回 Promise<ThemeName>）
 *   • isTransitioning —— 当前是否正在过渡
 */
export function useTheme() {
  const themeName = computed(() => currentTheme.value)
  const theme = computed(() => themes[currentTheme.value])
  const isDark = computed(() => currentTheme.value === 'dark')
  const isTransitioning = ref(false)
  return {
    themeName,
    theme,
    isDark,
    isTransitioning: computed(() => isTransitioning.value),
    setTheme: async (name: ThemeName, opts?: SetThemeOptions) => {
      isTransitioning.value = true
      try {
        return await setTheme(name, opts)
      } finally {
        isTransitioning.value = false
      }
    },
    toggleTheme: async (opts?: SetThemeOptions) => {
      isTransitioning.value = true
      try {
        return await setTheme(isDark.value ? 'light' : 'dark', opts)
      } finally {
        isTransitioning.value = false
      }
    },
  }
}

/** 兜底：把主题初始化到 light（避免 SSR / 测试环境报错） */
export function initTheme(initial: ThemeName = 'light'): void {
  setTheme(initial)
}