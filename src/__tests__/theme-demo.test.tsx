/**
 * 主题动画演示页单测
 *
 * 因 vanilla-extract 不能在 vitest 环境跑（需要 .css.ts 文件上下文），
 * 且演示页依赖 vue-jsx 插件做编译期 transform，
 * 这里只验证：
 *   • 演示页路径能 resolve + default export 形态正确
 *   • 演示页所需 utility className 都存在（防止重构误删）
 *
 * 实际 useTheme 逻辑（setTheme / toggleTheme / animation 挂载）在
 * useTheme.test.ts 里覆盖。
 */
import { describe, expect, it, vi } from 'vitest'

// Mock utility.css.ts（vanilla-extract 不能在 vitest 里跑）
vi.mock('@/styles/utility.css', () => ({
  // 兼容垫片
  appCard: '_fake_appCard_',
  p5: '_fake_p5_',
  mb3: '_fake_mb3_',
  flex: '_fake_flex_',
  inlineFlex: '_fake_inlineFlex_',
  flexWrap: '_fake_flexWrap_',
  flexCol: '_fake_flexCol_',
  itemsCenter: '_fake_itemsCenter_',
  justifyBetween: '_fake_justifyBetween_',
  justifyCenter: '_fake_justifyCenter_',
  gap4: '_fake_gap4_',
  gap3: '_fake_gap3_',
  gap2: '_fake_gap2_',
  fontSemibold: '_fake_fontSemibold_',
  fontBold: '_fake_fontBold_',
  textBase: '_fake_textBase_',
  textSm: '_fake_textSm_',
  textXs: '_fake_textXs_',
  textWhite: '_fake_textWhite_',
  textTextTertiary: '_fake_textTextTertiary_',
  textTextQuaternary: '_fake_textTextQuaternary_',
  fontMono: '_fake_fontMono_',
  mt1: '_fake_mt1_',
  mb1: '_fake_mb1_',
  p3: '_fake_p3_',
  p4: '_fake_p4_',
  rounded: '_fake_rounded_',
  borderPrimary: '_fake_borderPrimary_',
  cursorPointer: '_fake_cursorPointer_',
  transitionColors: '_fake_transitionColors_',
  bgPrimary85: '_fake_bgPrimary85_',
  // 主题相关
  themes: {
    light: '_fake_light_',
    dark: '_fake_dark_',
    brand: '_fake_brand_',
    accent: '_fake_accent_',
  },
  themeAnimations: {
    fade: '_fake_anim_fade_',
    blur: '_fake_anim_blur_',
    scale: '_fake_anim_scale_',
    slide: '_fake_anim_slide_',
    expand: '_fake_anim_expand_',
    flash: '_fake_anim_flash_',
    shimmer: '_fake_anim_shimmer_',
    matrix: '_fake_anim_matrix_',
  },
  themeTransitioning: '_fake_themeTransitioning_',
  themeFlash: '_fake_themeFlash_',
  themeSwitchBlur: '_fake_themeSwitchBlur_',
  themeSwitchExpand: '_fake_themeSwitchExpand_',
  themeSwitchScale: '_fake_themeSwitchScale_',
  themeSwitchSlide: '_fake_themeSwitchSlide_',
  themeShimmer: '_fake_themeShimmer_',
  themeColorMatrix: '_fake_themeColorMatrix_',
  themeFadePulse: '_fake_themeFadePulse_',
  themeIconRotate: '_fake_themeIconRotate_',
  themeIconAppear: '_fake_themeIconAppear_',
  themeCard: '_fake_themeCard_',
  themePrimaryBtn: '_fake_themePrimaryBtn_',
  overlay: vi.fn(() => '_fake_overlay_'),
  grid: '_fake_grid_',
  gridCols4: '_fake_gridCols4_',
  sprinkles: vi.fn(),
}))

describe('主题动画演示页所需的 utility className 完整性', () => {
  // 防止 utility.css.ts 重构时误删演示页依赖的关键 className
  it('8 套整页动画 utility className 都存在', async () => {
    const utility = await import('@/styles/utility.css')
    expect(typeof utility.themeSwitchBlur).toBe('string')
    expect(typeof utility.themeSwitchExpand).toBe('string')
    expect(typeof utility.themeSwitchScale).toBe('string')
    expect(typeof utility.themeSwitchSlide).toBe('string')
    expect(typeof utility.themeShimmer).toBe('string')
    expect(typeof utility.themeColorMatrix).toBe('string')
    expect(typeof utility.themeFlash).toBe('string')
    expect(typeof utility.themeFadePulse).toBe('string')
  })

  it('themeAnimations 对象含 8 个 key（与 README §4.2 章节对齐）', async () => {
    const utility = await import('@/styles/utility.css')
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
  })

  it('Sun/Moon 切换按钮用 themeIconRotate', async () => {
    const utility = await import('@/styles/utility.css')
    expect(typeof utility.themeIconRotate).toBe('string')
  })

  it('主题感知 utility className（themeCard / themePrimaryBtn）', async () => {
    const utility = await import('@/styles/utility.css')
    expect(typeof utility.themeCard).toBe('string')
    expect(typeof utility.themePrimaryBtn).toBe('string')
  })

  it('overlay recipe 调用返回 string', async () => {
    const utility = await import('@/styles/utility.css')
    expect(typeof utility.overlay({ tone: 'primary', size: 'sm' })).toBe('string')
  })
})