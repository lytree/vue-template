/**
 * 主题切换的运行时 helper —— SCSS Modules 版
 *
 * 与 vanilla-extract 版本差异：
 *   • 没有「vanilla-extract 编译生成的 hash className」（如 themes.dark / themeTransitioning）
 *   • 整页动画的 className（themeFadePulse / themeSwitchBlur / ...）改由
 *     src/styles/animations.scss 提供（全局普通 CSS，keyframe + 简单 className）
 *   • 业务 TSX 只通过 `class="themeFadePulse"` / `class="themeSwitchBlur"` 使用
 *
 * 用法：
 *   import { setTheme, useTheme, themeOptions } from '@/styles/useTheme'
 *   const { theme, setTheme } = useTheme()
 *   <section class={theme}>当前主题子树</section>
 */
import { computed, ref } from 'vue'

export type ThemeName = 'light' | 'dark' | 'brand' | 'accent'
export type ThemeAnimationName =
  | 'fade'
  | 'blur'
  | 'scale'
  | 'slide'
  | 'expand'
  | 'flash'
  | 'shimmer'
  | 'matrix'

/**
 * 主题 className（vanilla-extract 版的 `themes` 对象 → 改用常量字符串）。
 * 业务 TSX 通过 `<section class={theme}>` 即可拿到当前主题子树作用域。
 * ⚠️ 与 vanilla-extract 不同：这些不是 hash 编译产物，需要业务类名配合
 * （实际 CSS 在 src/styles/themes.scss 提供）。
 */
export const themes: Record<ThemeName, string> = {
  light: 'theme-light',
  dark: 'theme-dark',
  brand: 'theme-brand',
  accent: 'theme-accent',
}

/** 8 套整页动画 className —— 实际 keyframe 在 src/styles/animations.scss */
export const themeAnimations: Record<ThemeAnimationName, string> = {
  fade: 'theme-fade-pulse',
  blur: 'theme-switch-blur',
  scale: 'theme-switch-scale',
  slide: 'theme-switch-slide',
  expand: 'theme-switch-expand',
  flash: 'theme-flash',
  shimmer: 'theme-shimmer',
  matrix: 'theme-color-matrix',
}

/** 主题过渡启用标记（setTheme 调用瞬间挂在 <html> 上） */
export const themeTransitioning = 'theme-transitioning'

/** 整页闪烁（triggerThemeFlash 调用瞬间挂在 body 上） */
export const themeFlash = 'theme-flash'

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

const currentTheme = ref<ThemeName>('light')
const THEME_TRANSITION_MS = 350

export interface SetThemeOptions {
  animate?: boolean
  duration?: number
  easing?: string
  viewTransition?: boolean
  animation?: ThemeAnimationName | false
  bodyClass?: string
  originX?: number
  originY?: number
}

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

  const apply = () => {
    if (animate) {
      if (duration !== THEME_TRANSITION_MS || easing !== 'cubic-bezier(0.4, 0, 0.2, 1)') {
        root.style.setProperty('--theme-transition-duration', `${duration}ms`)
        root.style.setProperty('--theme-transition-easing', easing)
      }
      root.classList.add(themeTransitioning)

      if (body) {
        const animClass = bodyClass ?? (animation && themeAnimations[animation])
        if (animClass) {
          body.classList.add(animClass)
          const maxAnimMs = Math.max(duration, getAnimMaxDuration(animation))
          window.setTimeout(() => body.classList.remove(animClass), maxAnimMs + 50)
        }

        if (originX !== undefined && originY !== undefined) {
          root.style.setProperty('--theme-ripple-x', `${originX}px`)
          root.style.setProperty('--theme-ripple-y', `${originY}px`)
        }
      }

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
    pendingResolve = resolve

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

export function setThemeSync(name: ThemeName): void {
  currentTheme.value = name
  if (typeof document === 'undefined') return
  applyThemeClass(document.documentElement, name)
  if (name === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

let pendingResolve: ((value: ThemeName) => void) | null = null
function resolveThemeTransition(name: ThemeName): void {
  if (pendingResolve) {
    pendingResolve(name)
    pendingResolve = null
  }
}

function getAnimMaxDuration(name: ThemeAnimationName | false): number {
  if (!name) return 0
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

function applyThemeClass(root: HTMLElement, name: ThemeName): void {
  root.classList.remove(themes.light, themes.dark, themes.brand, themes.accent)
  if (name !== 'light') root.classList.add(themes[name])
  if (name === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function triggerThemeFlash(durationMs = 200): void {
  if (typeof document === 'undefined') return
  const body = document.body
  if (!body) return
  body.classList.add(themeFlash)
  window.setTimeout(() => body.classList.remove(themeFlash), durationMs)
}

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

export function getTheme(): ThemeName {
  return currentTheme.value
}

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

export function initTheme(initial: ThemeName = 'light'): void {
  setTheme(initial)
}