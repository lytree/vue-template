/**
 * utility.ts —— SCSS Modules 时代的 utility className 入口
 *
 * 与 vanilla-extract 版的差异：
 *   • 全部 className 都是普通字符串（不再是 vanilla-extract 编译期 hash）
 *   • 实际 CSS 在 src/styles/utility.scss（全局样式表）
 *   • 不需要任何编译期文件上下文，可在 vitest 直接 import
 *
 * 业务用法保持一致：
 *   import * as u from '@/styles/utility'
 *   <div class={`${u.flex} ${u.gap3} ${u.p5}`} />
 *
 * 设计令牌约定：
 *   • spacing —— --space-unit（4px）
 *   • 主题感知色 —— --ant-color-* / --theme-*
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ---------- 布局 ---------- */
export const flex           = 'flex'
export const inlineFlex     = 'inlineFlex'
export const grid           = 'grid'
export const block          = 'block'
export const flexCol        = 'flexCol'
export const flexRow        = 'flexRow'
export const flexWrap       = 'flexWrap'
export const itemsCenter    = 'itemsCenter'
export const itemsStart     = 'itemsStart'
export const itemsEnd       = 'itemsEnd'
export const itemsBaseline  = 'itemsBaseline'
export const justifyCenter  = 'justifyCenter'
export const justifyBetween = 'justifyBetween'

/* ---------- 间距 ---------- */
export const p1  = 'p1'
export const p2  = 'p2'
export const p3  = 'p3'
export const p4  = 'p4'
export const p5  = 'p5'
export const p6  = 'p6'
export const px4 = 'px4'
export const px6 = 'px6'
export const py2 = 'py2'

export const gap1  = 'gap1'
export const gap2  = 'gap2'
export const gap3  = 'gap3'
export const gap4  = 'gap4'
export const gapX8 = 'gapX8'
export const gapY3 = 'gapY3'

export const mt0_5 = 'mt0_5'
export const mt1   = 'mt1'
export const mt2   = 'mt2'
export const mt3   = 'mt3'
export const mt4   = 'mt4'
export const mb1   = 'mb1'
export const mb3   = 'mb3'
export const mr1   = 'mr1'
export const pb3   = 'pb3'

/* ---------- 尺寸 ---------- */
export const wFull      = 'wFull'
export const w20        = 'w20'
export const hFull      = 'hFull'
export const h14        = 'h14'
export const minW0      = 'minW0'
export const minH0      = 'minH0'
export const minHScreen = 'minHScreen'
export const size9      = 'size9'
export const maxW3xl    = 'maxW3xl'
export const maxWmd     = 'maxWmd'
export const maxWxl     = 'maxWxl'
export const flex1      = 'flex1'
export const shrink0    = 'shrink0'

export const importantWFull = 'importantWFull'
export const importantW40   = 'importantW40'
export const importantW52   = 'importantW52'
export const importantW64   = 'importantW64'
export const importantW72   = 'importantW72'
export const importantMy5   = 'importantMy5'
export const importantMr1   = 'importantMr1'

/* ---------- 文字 ---------- */
export const textXs    = 'textXs'
export const textSm    = 'textSm'
export const textBase  = 'textBase'
export const textLg    = 'textLg'
export const textXl    = 'textXl'
export const text3xl   = 'text3xl'

export const fontMedium   = 'fontMedium'
export const fontSemibold = 'fontSemibold'
export const fontBold     = 'fontBold'
export const fontMono     = 'fontMono'

export const tabularNums = 'tabularNums'
export const truncate    = 'truncate'
export const textCenter  = 'textCenter'

export const textPrimary        = 'textPrimary'
export const textTextSecondary  = 'textTextSecondary'
export const textTextTertiary   = 'textTextTertiary'
export const textTextQuaternary = 'textTextQuaternary'
export const textWhite          = 'textWhite'
export const textError          = 'textError'

/* ---------- 背景 / 边框 ---------- */
export const bgLayout        = 'bgLayout'
export const bgContainer     = 'bgContainer'
export const bgPrimary       = 'bgPrimary'
export const bgPrimary85     = 'bgPrimary85'

export const border          = 'border'
export const borderR         = 'borderR'
export const borderB         = 'borderB'
export const borderPrimary   = 'borderPrimary'
export const borderSecondary = 'borderSecondary'

export const rounded       = 'rounded'
export const cursorPointer = 'cursorPointer'
export const divideY       = 'divideY'

/* ---------- 过渡 / 动画 ---------- */
export const transitionColors = 'transitionColors'
export const transitionWidth  = 'transitionWidth'

export const trendUp   = 'trendUp'
export const trendDown = 'trendDown'

/* ---------- 通用工具 ---------- */
export const overflowHidden = 'overflowHidden'
export const overflowYAuto  = 'overflowYAuto'
export const group          = 'group'

/* ---------- 应用卡片 / 顶栏 ---------- */
export const appCard          = 'appCard'
export const appCardHoverable = 'appCardHoverable'
export const iconButton       = 'iconButton'
export const userTrigger      = 'userTrigger'
export const stackCol         = 'stackCol'
export const shadowAntd       = 'appCard' /* 同语义：卡片投影 */

/* ---------- 业务专属：dashboard ---------- */
export const trendBar    = 'trendBar'
export const activityDot = 'activityDot'
export const shortcutCard = 'shortcutCard'

/* ---------- 响应式 grid ---------- */
export const smGridCols2 = 'smGridCols2'
export const smGridCols3 = 'smGridCols3'
export const gridCols1   = 'gridCols1'
export const gridCols4   = 'gridCols4'
export const xlGridCols3 = 'xlGridCols3'
export const xlGridCols4 = 'xlGridCols4'
export const xlColSpan2  = 'xlColSpan2'

/* ---------- 主题感知 utility（实际 keyframe 在 animations.scss）---------- */
export const themeCard       = 'themeCard'
export const themePrimaryBtn = 'themePrimaryBtn'
export const themeColorPrimary = 'theme-primary-color'

export const themeSwitchBlur   = 'theme-switch-blur'
export const themeSwitchScale  = 'theme-switch-scale'
export const themeSwitchSlide  = 'theme-switch-slide'
export const themeSwitchExpand = 'theme-switch-expand'
export const themeShimmer      = 'theme-shimmer'
export const themeColorMatrix  = 'theme-color-matrix'
export const themeFlash        = 'theme-flash'
export const themeFadePulse    = 'theme-fade-pulse'

export const themeTransitioning = 'theme-transitioning'
export const themeTransitionFast = 'theme-transition-fast'
export const themeTransitionSlow = 'theme-transition-slow'
export const themeTransitionNone = 'theme-transition-none'

export const themeIconRotate = 'themeIconRotate'
export const themeIconAppear = 'themeIconAppear'

/* ---------- themeContract (theme-aware tokens) ---------- */
export const themeContract = {
  color: 'var(--theme-color)',
  bg: 'var(--theme-bg)',
  text: 'var(--theme-text)',
  'text-secondary': 'var(--theme-text-secondary)',
  border: 'var(--theme-border)',
  success: 'var(--theme-success)',
  warning: 'var(--theme-warning)',
  error: 'var(--theme-error)',
} as const

/* ---------- 主题 className ---------- */
export const themes = {
  light: 'theme-light',
  dark: 'theme-dark',
  brand: 'theme-brand',
  accent: 'theme-accent',
} as const
export const lightTheme  = themes.light
export const darkTheme   = themes.dark
export const brandTheme  = themes.brand
export const accentTheme = themes.accent

/* ---------- 8 套整页动画 ---------- */
export const themeAnimations = {
  fade: themeFadePulse,
  blur: themeSwitchBlur,
  scale: themeSwitchScale,
  slide: themeSwitchSlide,
  expand: themeSwitchExpand,
  flash: themeFlash,
  shimmer: themeShimmer,
  matrix: themeColorMatrix,
} as const

/* ---------- dynamic CSS variable names (for applyDynamic) ---------- */
export const dynamicVarNames: Record<
  'color' | 'bg' | 'ringColor' | 'ringWidth' | 'ringOpacity' | 'borderColor' | 'textColor' | 'gradientFrom' | 'gradientVia' | 'gradientTo',
  string
> = {
  color: '--utility-color',
  bg: '--utility-background-color',
  ringColor: '--utility-ringColor',
  ringWidth: '--utility-ringWidth',
  ringOpacity: '--utility-ringOpacity',
  borderColor: '--utility-borderColor',
  textColor: '--utility-textColor',
  gradientFrom: '--utility-gradientFrom',
  gradientVia: '--utility-gradientVia',
  gradientTo: '--utility-gradientTo',
}

/* ---------- overlay recipe (theme demo 用) ---------- */
export interface OverlayOpts {
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'default'
  size?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md'
}
export function overlay(opts: OverlayOpts = {}): string {
  const tone = opts.tone ?? 'default'
  const size = opts.size ?? 'md'
  const padding = opts.padding ?? 'md'
  return `overlay overlay-tone-${tone} overlay-size-${size} overlay-pad-${padding}`
}

/* ---------- card / button / iconBtn recipes (保持 API 兼容) ---------- */
export interface RecipeOpts {
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}
export function card(opts: RecipeOpts = {}): string {
  return `recipe-card recipe-card-${opts.size ?? 'md'}`
}
export function button(opts: RecipeOpts = {}): string {
  return `recipe-button recipe-button-${opts.size ?? 'md'}${opts.block ? ' recipe-button-block' : ''}`
}
export function iconBtn(_opts: RecipeOpts = {}): string {
  return 'recipe-iconBtn'
}
export function dot(_opts: Record<string, unknown> = {}): string {
  return 'recipe-dot'
}

/* ---------- sprinkles mock（保持导入兼容） ---------- */
export function sprinkles(_props: Record<string, unknown>): string {
  return ''
}

/* ---------- default export —— 让两种写法都通 ---------- */
export default {
  flex, inlineFlex, grid, block, flexCol, flexRow, flexWrap,
  itemsCenter, itemsStart, itemsEnd, itemsBaseline, justifyCenter, justifyBetween,
  p1, p2, p3, p4, p5, p6, px4, px6, py2,
  gap1, gap2, gap3, gap4, gapX8, gapY3,
  mt0_5, mt1, mt2, mt3, mt4, mb1, mb3, mr1, pb3,
  wFull, w20, hFull, h14, minW0, minH0, minHScreen, size9, maxW3xl, maxWmd, maxWxl, flex1, shrink0,
  importantWFull, importantW40, importantW52, importantW64, importantW72, importantMy5, importantMr1,
  textXs, textSm, textBase, textLg, textXl, text3xl,
  fontMedium, fontSemibold, fontBold, fontMono,
  tabularNums, truncate, textCenter,
  textPrimary, textTextSecondary, textTextTertiary, textTextQuaternary, textWhite, textError,
  bgLayout, bgContainer, bgPrimary, bgPrimary85,
  border, borderR, borderB, borderPrimary, borderSecondary,
  rounded, cursorPointer, divideY,
  transitionColors, transitionWidth,
  trendUp, trendDown,
  overflowHidden, overflowYAuto, group,
  appCard, appCardHoverable, iconButton, userTrigger, stackCol, shadowAntd,
  trendBar, activityDot, shortcutCard,
  smGridCols2, smGridCols3, gridCols1, gridCols4, xlGridCols3, xlGridCols4, xlColSpan2,
  themeCard, themePrimaryBtn, themeColorPrimary,
  themeSwitchBlur, themeSwitchScale, themeSwitchSlide, themeSwitchExpand,
  themeShimmer, themeColorMatrix, themeFlash, themeFadePulse,
  themeTransitioning, themeTransitionFast, themeTransitionSlow, themeTransitionNone,
  themeIconRotate, themeIconAppear,
  themeContract, themes, lightTheme, darkTheme, brandTheme, accentTheme, themeAnimations,
  dynamicVarNames, overlay, card, button, iconBtn, dot, sprinkles,
}

// 兼容旧 import 路径：'@/styles/utility.css'
// （如果之前测试 mock 用过这个 alias）
export type Sprinkles = Record<string, string>
