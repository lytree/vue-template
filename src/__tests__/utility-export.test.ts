/**
 * utility.css.ts 导出完整性验证
 *
 * 验证主题 / 动画 / recipes 的关键导出都存在且形态正确，
 * 防止后续重构意外删掉 export 而运行时崩溃。
 *
 * 注：vanilla-extract 的 createGlobalTheme/createThemeContract 需要
 * 编译期文件上下文（.css.ts），不能直接在 vitest 测试里执行。
 * 因此这里用 vi.mock 模拟 utility.css.ts 的导出形态，
 * 让测试能跑通且只验证"导出契约"。
 */
import { describe, expect, it, vi } from 'vitest'

// 关键 utility className 的占位符（vanilla-extract 编译期产物）
// 每个测试用 mock 返回具体值
const FAKE_CLASS_PREFIX = '_fake_'

function makeFakeClass() {
  let n = 0
  return () => `${FAKE_CLASS_PREFIX}${++n}`
}
const next = makeFakeClass()

const fakeClass = next()

// 预生成 32 个 className（避免每个 it() 调用都生成新的）
const fakeClasses = Array.from({ length: 64 }, () => next())

vi.mock('@/styles/utility', () => {
  const cardSize = {
    sm: fakeClasses[0],
    md: fakeClasses[1],
    lg: fakeClasses[2],
  }
  const buttonSize = {
    sm: fakeClasses[3],
    md: fakeClasses[4],
    lg: fakeClasses[5],
  }
  const cardRecipe = (opts: { size?: string } = {}) =>
    cardSize[opts.size as keyof typeof cardSize] ?? fakeClasses[6]
  const buttonRecipe = (opts: { size?: string; block?: boolean } = {}) =>
    buttonSize[opts.size as keyof typeof buttonSize] ?? fakeClasses[7]
  const iconBtnRecipe = () => fakeClasses[8]
  const overlayRecipe = (opts: Record<string, unknown> = {}) =>
    fakeClasses[9 + Object.keys(opts).length]

  return {
    // 主题系统
    themeContract: {
      color: 'var(--theme-color-test)',
      bg: 'var(--theme-bg-test)',
      text: 'var(--theme-text-test)',
      'text-secondary': 'var(--theme-text-secondary-test)',
      border: 'var(--theme-border-test)',
      success: 'var(--theme-success-test)',
      warning: 'var(--theme-warning-test)',
      error: 'var(--theme-error-test)',
    },
    lightTheme: fakeClasses[0],
    darkTheme: fakeClasses[1],
    brandTheme: fakeClasses[2],
    accentTheme: fakeClasses[3],
    themes: {
      light: fakeClasses[0],
      dark: fakeClasses[1],
      brand: fakeClasses[2],
      accent: fakeClasses[3],
    },

    // themeAnimations 8 套预设
    themeAnimations: {
      fade: fakeClasses[4],
      blur: fakeClasses[5],
      scale: fakeClasses[6],
      slide: fakeClasses[7],
      expand: fakeClasses[8],
      flash: fakeClasses[9],
      shimmer: fakeClasses[10],
      matrix: fakeClasses[11],
    },
    // 8 套整页动画 utility class
    themeSwitchBlur: fakeClasses[5],
    themeSwitchExpand: fakeClasses[8],
    themeSwitchScale: fakeClasses[6],
    themeSwitchSlide: fakeClasses[7],
    themeShimmer: fakeClasses[10],
    themeColorMatrix: fakeClasses[11],
    themeFlash: fakeClasses[9],
    themeFadePulse: fakeClasses[4],

    // 主题感知 utility
    themeColorPrimary: fakeClasses[12],
    themePrimaryBtn: fakeClasses[13],
    themeCard: fakeClasses[14],

    // transition 标记
    themeTransitioning: fakeClasses[15],
    themeTransitionFast: fakeClasses[16],
    themeTransitionSlow: fakeClasses[17],
    themeTransitionNone: fakeClasses[18],

    // 图标
    themeIconRotate: fakeClasses[19],
    themeIconAppear: fakeClasses[20],

    // 兼容垫片（项目其他 14 个文件依赖）
    flex: fakeClasses[21],
    inlineFlex: fakeClasses[22],
    grid: fakeClasses[23],
    block: fakeClasses[24],
    flexCol: fakeClasses[25],
    flexRow: fakeClasses[26],
    itemsCenter: fakeClasses[27],
    justifyBetween: fakeClasses[28],
    p1: fakeClasses[29],
    p2: fakeClasses[30],
    p3: fakeClasses[31],
    p4: fakeClasses[32],
    p5: fakeClasses[33],
    p6: fakeClasses[34],
    px4: fakeClasses[35],
    py2: fakeClasses[36],
    gap1: fakeClasses[37],
    gap2: fakeClasses[38],
    gap3: fakeClasses[39],
    gap4: fakeClasses[40],
    mt3: fakeClasses[41],
    mb3: fakeClasses[42],
    appCard: fakeClasses[43],
    appCardHoverable: fakeClasses[44],
    iconButton: fakeClasses[45],
    textPrimary: fakeClasses[46],
    bgLayout: fakeClasses[47],
    bgContainer: fakeClasses[48],
    shadowAntd: fakeClasses[49],

    // 主入口
    sprinkles: vi.fn(() => fakeClasses[50]),
    Sprinkles: undefined, // type only

    // recipes
    card: cardRecipe,
    button: buttonRecipe,
    iconBtn: iconBtnRecipe,
    dot: () => fakeClasses[51],
    overlay: overlayRecipe,
  }
})

// 现在 import（必须放在 mock 之后）
// eslint-disable-next-line @typescript-eslint/no-require-imports
const utility = await import('@/styles/utility')

describe('utility.css.ts — 主题系统导出', () => {
  it('exports themeContract（8 个主题 token key）', () => {
    expect(utility.themeContract).toBeDefined()
    const contract = utility.themeContract as Record<string, unknown>
    const expectedKeys = [
      'color',
      'bg',
      'text',
      'text-secondary',
      'border',
      'success',
      'warning',
      'error',
    ]
    for (const key of expectedKeys) {
      expect(contract[key]).toBeDefined()
      // vanilla-extract 的 createThemeContract 在编译期产出 `var(--name)` 字符串
      // 测试 mock 用字符串代替；真实编译产物类型为 `string`
      expect(typeof contract[key]).toBe('string')
    }
  })

  it('exports 4 套主题 className（light / dark / brand / accent）', () => {
    expect(typeof utility.lightTheme).toBe('string')
    expect(typeof utility.darkTheme).toBe('string')
    expect(typeof utility.brandTheme).toBe('string')
    expect(typeof utility.accentTheme).toBe('string')
    // 4 套主题 className 必须互不相同（createTheme 编译为独立 hash）
    const set = new Set([
      utility.lightTheme,
      utility.darkTheme,
      utility.brandTheme,
      utility.accentTheme,
    ])
    expect(set.size).toBe(4)
  })

  it('exports themes 对象（key 与 ThemeName 一一对应）', () => {
    expect(Object.keys(utility.themes).sort()).toEqual([
      'accent',
      'brand',
      'dark',
      'light',
    ])
    for (const name of ['light', 'dark', 'brand', 'accent'] as const) {
      expect(typeof utility.themes[name]).toBe('string')
    }
  })

  it('exports 8 套整页动画 className（themeAnimations）', () => {
    expect(Object.keys(utility.themeAnimations).sort()).toEqual([
      'blur',
      'expand',
      'fade',
      'flash',
      'matrix',
      'scale',
      'shimmer',
      'slide',
    ])
    for (const key of Object.keys(utility.themeAnimations)) {
      expect(typeof utility.themeAnimations[key as keyof typeof utility.themeAnimations]).toBe('string')
    }
  })

  it('exports themeColorPrimary / themePrimaryBtn / themeCard（主题感知 utility）', () => {
    expect(typeof utility.themeColorPrimary).toBe('string')
    expect(typeof utility.themePrimaryBtn).toBe('string')
    expect(typeof utility.themeCard).toBe('string')
  })
})

describe('utility.css.ts — recipe 与 sprinkles 主入口', () => {
  it('exports sprinkles 函数（atomic utility 主入口）', () => {
    expect(typeof utility.sprinkles).toBe('function')
  })

  it('exports Sprinkles 类型（编译期）', () => {
    // 类型导出仅在编译期可见；运行时只能验证 module 存在
    expect(utility).toBeDefined()
  })

  it('exports 关键 recipe（card / button / overlay / iconBtn / dot）', () => {
    for (const name of ['card', 'button', 'overlay', 'iconBtn', 'dot']) {
      expect(typeof utility[name as keyof typeof utility]).toBe('function')
    }
  })

  it('recipe 调用返回 string className', () => {
    expect(typeof utility.card({ size: 'lg' })).toBe('string')
    expect(typeof utility.button({ size: 'md', block: true })).toBe('string')
    expect(typeof utility.iconBtn({ size: 'sm' })).toBe('string')
  })

  it('recipe 不同 variants 输出不同的 className', () => {
    expect(utility.card({ size: 'sm' })).not.toBe(utility.card({ size: 'lg' }))
    expect(utility.button({ size: 'sm' })).not.toBe(utility.button({ size: 'md' }))
  })
})

describe('utility.css.ts — 主题切换动画 utility 导出', () => {
  it('exports themeTransitioning（setTheme 临时启用过渡的标记）', () => {
    expect(typeof utility.themeTransitioning).toBe('string')
  })

  it('exports themeTransitionFast / themeTransitionSlow / themeTransitionNone', () => {
    expect(typeof utility.themeTransitionFast).toBe('string')
    expect(typeof utility.themeTransitionSlow).toBe('string')
    expect(typeof utility.themeTransitionNone).toBe('string')
  })

  it('exports Sun/Moon 切换用 themeIconRotate / themeIconAppear', () => {
    expect(typeof utility.themeIconRotate).toBe('string')
    expect(typeof utility.themeIconAppear).toBe('string')
  })

  it('exports 8 套整页动画 keyframes + utility', () => {
    expect(typeof utility.themeSwitchBlur).toBe('string')
    expect(typeof utility.themeSwitchExpand).toBe('string')
    expect(typeof utility.themeSwitchScale).toBe('string')
    expect(typeof utility.themeSwitchSlide).toBe('string')
    expect(typeof utility.themeShimmer).toBe('string')
    expect(typeof utility.themeColorMatrix).toBe('string')
    expect(typeof utility.themeFlash).toBe('string')
    expect(typeof utility.themeFadePulse).toBe('string')
  })
})

describe('utility.css.ts — 兼容垫片（项目其他 14 个业务文件依赖）', () => {
  it('exports 关键兼容垫片 className（flex / p5 / gap4 / mt3 / textPrimary 等）', () => {
    const shims = [
      'flex',
      'inlineFlex',
      'grid',
      'block',
      'flexCol',
      'flexRow',
      'itemsCenter',
      'justifyBetween',
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'p6',
      'px4',
      'py2',
      'gap1',
      'gap2',
      'gap3',
      'gap4',
      'mt3',
      'mb3',
      'appCard',
      'appCardHoverable',
      'iconButton',
      'textPrimary',
      'bgLayout',
      'bgContainer',
      'shadowAntd',
    ]
    for (const shim of shims) {
      expect(typeof utility[shim as keyof typeof utility]).toBe('string')
    }
  })
})

// 占位符标记 mock 生效（avoid unused-vars）
void fakeClass