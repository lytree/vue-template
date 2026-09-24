/**
 * useTheme.ts 单测 —— 主题切换 API（mock vanilla-extract 部分）
 *
 * 注：utility.css.ts 的 createGlobalTheme/createThemeContract 需要
 * 编译期文件上下文（.css.ts）。测试里 mock 掉 utility.css.ts 的导出。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock utility.css.ts —— vanilla-extract 不能在 vitest 里跑
const fakeThemes = {
  light: '_fake_light_theme_',
  dark: '_fake_dark_theme_',
  brand: '_fake_brand_theme_',
  accent: '_fake_accent_theme_',
}
const fakeThemeAnimations = {
  fade: '_fake_anim_fade_',
  blur: '_fake_anim_blur_',
  scale: '_fake_anim_scale_',
  slide: '_fake_anim_slide_',
  expand: '_fake_anim_expand_',
  flash: '_fake_anim_flash_',
  shimmer: '_fake_anim_shimmer_',
  matrix: '_fake_anim_matrix_',
}
const fakeTransitioning = '_fake_theme_transitioning_'
const fakeFlash = '_fake_theme_flash_'

vi.mock('@/styles/utility.css', () => ({
  themes: fakeThemes,
  themeAnimations: fakeThemeAnimations,
  themeTransitioning: fakeTransitioning,
  themeFlash: fakeFlash,
}))

// 现在 import useTheme（在 mock 之后）
const { useTheme, setThemeSync, beginThemeTransition, themeOptions, triggerThemeFlash, setTheme, getTheme } =
  await import('@/styles/useTheme')

beforeEach(() => {
  // 每个测试前清理 html / body className 与 timer
  document.documentElement.className = ''
  document.body && (document.body.className = '')
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('themeOptions', () => {
  it('导出 4 套主题元数据', () => {
    expect(themeOptions).toHaveLength(4)
  })

  it('每项含 name / label / description', () => {
    for (const opt of themeOptions) {
      expect(opt).toHaveProperty('name')
      expect(opt).toHaveProperty('label')
      expect(opt).toHaveProperty('description')
    }
  })

  it('name 字段与 ThemeName 类型一一对应', () => {
    const names = themeOptions.map((o) => o.name).sort()
    expect(names).toEqual(['accent', 'brand', 'dark', 'light'])
  })
})

describe('getTheme() 初始状态', () => {
  it('返回合法 ThemeName 之一', () => {
    const name = getTheme()
    expect(['light', 'dark', 'brand', 'accent']).toContain(name)
  })
})

describe('setThemeSync(name)', () => {
  it('切到 dark 时挂 themes.dark + .dark', () => {
    setThemeSync('dark')
    const html = document.documentElement
    expect(html.classList.contains(fakeThemes.dark)).toBe(true)
    expect(html.classList.contains('dark')).toBe(true)
  })

  it('切到 light 时移除 themes.dark / .dark', () => {
    document.documentElement.classList.add(fakeThemes.dark, 'dark')
    setThemeSync('light')
    expect(document.documentElement.classList.contains(fakeThemes.dark)).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('切到 brand / accent 时挂对应 className，不挂 .dark', () => {
    setThemeSync('brand')
    expect(document.documentElement.classList.contains(fakeThemes.brand)).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    setThemeSync('accent')
    expect(document.documentElement.classList.contains(fakeThemes.accent)).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setThemeSync 返回 undefined（同步版本不返回 Promise）', () => {
    expect(setThemeSync('dark')).toBeUndefined()
  })
})

describe('beginThemeTransition(opts)', () => {
  it('挂 themeTransitioning className', () => {
    beginThemeTransition({ duration: 200 })
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(true)
  })

  it('duration 后清理 themeTransitioning（默认 350ms）', () => {
    beginThemeTransition()
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(true)
    vi.advanceTimersByTime(400)
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(false)
  })

  it('自定义 duration 也按时间清理', () => {
    // 内部 timer 在 duration + 50ms 后清理，所以 duration=100 实际 150ms 清理
    beginThemeTransition({ duration: 100 })
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(true)
    vi.advanceTimersByTime(149) // 还没到 150ms 阈值
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(true)
    vi.advanceTimersByTime(2) // 共 151ms，超过 150ms 阈值
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(false)
  })
})

describe('triggerThemeFlash()', () => {
  it('挂 themeFlash 到 body', () => {
    triggerThemeFlash()
    expect(document.body.classList.contains(fakeFlash)).toBe(true)
  })

  it('duration 后清理（默认 200ms）', () => {
    triggerThemeFlash()
    expect(document.body.classList.contains(fakeFlash)).toBe(true)
    vi.advanceTimersByTime(250)
    expect(document.body.classList.contains(fakeFlash)).toBe(false)
  })
})

describe('setTheme(name, opts)', () => {
  it('返回 Promise<ThemeName>', async () => {
    const p = setTheme('dark')
    expect(p).toBeInstanceOf(Promise)
    vi.advanceTimersByTime(500)
    const name = await p
    expect(name).toBe('dark')
  })

  it('animate: true 时挂 themeTransitioning', () => {
    void setTheme('dark')
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(true)
  })

  it('animate: false 不挂 themeTransitioning', () => {
    void setTheme('dark', { animate: false })
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(false)
  })

  it('duration + 50ms 后清理 themeTransitioning', () => {
    void setTheme('brand', { duration: 300 })
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(true)
    vi.advanceTimersByTime(350)
    expect(document.documentElement.classList.contains(fakeTransitioning)).toBe(false)
  })

  it('animation: "fade" 默认挂 themeAnimations.fade', () => {
    void setTheme('brand')
    expect(document.body.classList.contains(fakeThemeAnimations.fade)).toBe(true)
  })

  it('animation: "blur" 挂 themeAnimations.blur', () => {
    void setTheme('brand', { animation: 'blur' })
    expect(document.body.classList.contains(fakeThemeAnimations.blur)).toBe(true)
  })

  it('animation: "shimmer" 挂 themeAnimations.shimmer', () => {
    void setTheme('accent', { animation: 'shimmer' })
    expect(document.body.classList.contains(fakeThemeAnimations.shimmer)).toBe(true)
  })

  it('animation: false 不挂任何 body 动画', () => {
    void setTheme('brand', { animation: false })
    for (const key of Object.keys(fakeThemeAnimations)) {
      expect(
        document.body.classList.contains(
          fakeThemeAnimations[key as keyof typeof fakeThemeAnimations],
        ),
      ).toBe(false)
    }
  })

  it('originX / originY 注入到 --theme-ripple-x/y 变量', () => {
    void setTheme('dark', {
      animation: 'expand',
      originX: 123,
      originY: 456,
    })
    const root = document.documentElement
    expect(root.style.getPropertyValue('--theme-ripple-x')).toBe('123px')
    expect(root.style.getPropertyValue('--theme-ripple-y')).toBe('456px')
    // duration + 50ms 后清理
    vi.advanceTimersByTime(400)
    expect(root.style.getPropertyValue('--theme-ripple-x')).toBe('')
    expect(root.style.getPropertyValue('--theme-ripple-y')).toBe('')
  })

  it('自定义 easing / duration 通过 inline style 临时覆盖 CSS 变量', () => {
    void setTheme('dark', { duration: 600, easing: 'ease-in-out' })
    const root = document.documentElement
    expect(root.style.getPropertyValue('--theme-transition-duration')).toBe('600ms')
    expect(root.style.getPropertyValue('--theme-transition-easing')).toBe('ease-in-out')
    vi.advanceTimersByTime(650)
    expect(root.style.getPropertyValue('--theme-transition-duration')).toBe('')
    expect(root.style.getPropertyValue('--theme-transition-easing')).toBe('')
  })

  it('setTheme 实际切换 theme className', () => {
    void setTheme('dark')
    vi.advanceTimersByTime(400)
    expect(document.documentElement.classList.contains(fakeThemes.dark)).toBe(true)
  })

  it('多次快速切换：后续调用覆盖前序（不会累积 timer 冲突）', () => {
    void setTheme('dark')
    void setTheme('light')
    void setTheme('brand')
    vi.advanceTimersByTime(400)
    expect(document.documentElement.classList.contains(fakeThemes.brand)).toBe(true)
  })
})

describe('useTheme() hook', () => {
  it('返回响应式 themeName / theme / isDark / isTransitioning', () => {
    const h = useTheme()
    expect(typeof h.themeName.value).toBe('string')
    expect(typeof h.theme.value).toBe('string')
    expect(typeof h.isDark.value).toBe('boolean')
    expect(typeof h.isTransitioning.value).toBe('boolean')
  })

  it('setTheme wrapper：返回 Promise<ThemeName>', async () => {
    const h = useTheme()
    const p = h.setTheme('dark')
    expect(p).toBeInstanceOf(Promise)
    vi.advanceTimersByTime(400)
    await p
    expect(h.themeName.value).toBe('dark')
  })

  it('setTheme wrapper：isTransitioning 在过渡期间为 true', async () => {
    const h = useTheme()
    const p = h.setTheme('brand')
    // 立即检查
    expect(h.isTransitioning.value).toBe(true)
    vi.advanceTimersByTime(400)
    await p
    expect(h.isTransitioning.value).toBe(false)
  })

  it('toggleTheme wrapper：在 light ↔ dark 之间切换', async () => {
    const h = useTheme()
    setThemeSync('light')
    expect(h.themeName.value).toBe('light')
    expect(h.isDark.value).toBe(false)

    const p = h.toggleTheme()
    vi.advanceTimersByTime(400)
    await p
    expect(h.themeName.value).toBe('dark')
    expect(h.isDark.value).toBe(true)

    const p2 = h.toggleTheme()
    vi.advanceTimersByTime(400)
    await p2
    expect(h.themeName.value).toBe('light')
  })

  it('toggleTheme 接受 SetThemeOptions（opts 透传）', async () => {
    const h = useTheme()
    setThemeSync('light')

    const p = h.toggleTheme({ animation: 'shimmer', duration: 600 })
    expect(document.body.classList.contains(fakeThemeAnimations.shimmer)).toBe(true)
    vi.advanceTimersByTime(650)
    await p
  })
})

describe('ThemeName 类型完整性', () => {
  it('4 套主题都能作为 ThemeName 接受（运行时）', () => {
    const cases = [
      { name: 'light' as const, themeClass: fakeThemes.light },
      { name: 'dark' as const, themeClass: fakeThemes.dark },
      { name: 'brand' as const, themeClass: fakeThemes.brand },
      { name: 'accent' as const, themeClass: fakeThemes.accent },
    ]
    for (const { name, themeClass } of cases) {
      // 清理前序状态
      document.documentElement.className = ''
      setThemeSync(name)
      // light 是默认主题，themeContract 的 createTheme 不挂 className
      // （这是 setThemeSync 的设计，详见 useTheme.ts applyThemeClass 注释）
      if (name === 'light') {
        expect(document.documentElement.classList.contains(themeClass)).toBe(false)
      } else {
        expect(document.documentElement.classList.contains(themeClass)).toBe(true)
      }
      // dark 主题额外挂 `.dark`（兼容已有机制）
      if (name === 'dark') {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      } else {
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      }
    }
  })
})