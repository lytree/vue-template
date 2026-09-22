/**
 * 工具类 —— 基于 @vanilla-extract 全家桶
 *
 * 三层 API：
 *  1. `sprinkles({ display: 'flex', padding: '5', gap: '4' })` —— 原子化工具类，
 *     编译期合并为单个 hash class，天然没有样式覆盖问题。
 *  2. `card({ hoverable: true, size: 'lg' })` —— 多 variant 的语义组件样式，
 *     基于 @vanilla-extract/recipes 的 recipe() 实现，类型安全。
 *  3. `calc.multiply('--space-unit', 3)` —— 基于 @vanilla-extract/css-utils 的
 *     calc 表达式工具，编译期输出 calc(var(--space-unit) * 3) 这种变量化表达式。
 *     用于 recipe / style() 里需要跟随设计令牌缩放的内边距 / 高度。
 *
 * 设计原则：
 *  • 数字走 4px spacing scale：1=4px / 2=8px / 3=12px / 4=16px ……
 *  • 颜色全部走 antd 设计令牌（var(--ant-color-*)），dark mode 跟随 <html class="dark">
 *  • 响应式（sm / xl）是 sprinkles 的「条件变体」，
 *    写 `sprinkles({ display: { mobile: 'none', sm: 'block' } })` 即生效
 *  • 复杂选择器（`.group:hover &` / divideY）走 style() 兼容垫片
 *  • 语义化组件类（卡片 / 按钮 / 标签 / 徽章等）走 recipe()，提供 size / tone / state 等 variants
 *
 * —— 迁移策略 ——
 * 项目原有 ~300 个 style() 写死的工具类（import * as u from '@/styles/utility.css'）。
 * 它们已经是 atomic className、跟 sprinkles / recipes 的产物兼容。
 * 这里保留所有旧名（避免 14 个文件批量改 class 字符串），同时新增 `sprinkles()`
 * 与 recipe() 函数式 API —— 让后续新代码用 sprinkles / recipe 写法，
 * 老代码继续按 `u.flex / u.appCard / u.iconButton` 用即可。
 */
import { createGlobalTheme, globalStyle, style } from '@vanilla-extract/css'
import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes'
import { calc } from '@vanilla-extract/css-utils'

// ============================================================
// 0. spacing 设计令牌 —— 单一变量驱动整条 spacing scale
// ------------------------------------------------------------
// createGlobalTheme() 在 :root 上写入：
//   --space-unit: 4px
//   --space-1: calc(var(--space-unit) * 1)  = 4px
//   --space-2: calc(var(--space-unit) * 2)  = 8px
//   --space-3: calc(var(--space-unit) * 3)  = 12px
//   ...
// 所有 recipe / style() 里需要「固定 4 的倍数」的内边距 / 高度 / 间距都引用 --space-N。
// 未来要改 spacing 步长，只动 --space-unit 一处即可。
//
// 注：`calc` 是 css-utils 的运行时函数，**不能从 .css.ts 里直接 re-export**——
// vanilla-extract 编译器对 .css.ts 做了 AST 白名单（只允许 plain object/array/string/number）。
// 业务组件若需自建计算式样式，直接：
//   import { calc } from '@vanilla-extract/css-utils'
// ============================================================
createGlobalTheme(':root', {
  space: {
    unit: '4px',
    0: '0',
    px: '1px',
    '0_5': calc.multiply('var(--space-unit)', 0.5), // 2px
    1: calc.multiply('var(--space-unit)', 1), //   4px
    2: calc.multiply('var(--space-unit)', 2), //   8px
    3: calc.multiply('var(--space-unit)', 3), //  12px
    4: calc.multiply('var(--space-unit)', 4), //  16px
    5: calc.multiply('var(--space-unit)', 5), //  20px
    6: calc.multiply('var(--space-unit)', 6), //  24px
    8: calc.multiply('var(--space-unit)', 8), //  32px
  },
})

// ============================================================
// 1. 响应式断点（仅供 sprinkles 使用）
// ============================================================
const responsiveConditions = {
  mobile: {},
  sm: { '@media': 'screen and (min-width: 640px)' },
  xl: { '@media': 'screen and (min-width: 1280px)' },
} as const

// ============================================================
// 2. sprinkles 配置 —— 新代码统一从这里拿工具类
// ============================================================
const utilities = defineProperties({
  conditions: responsiveConditions,
  defaultCondition: 'mobile',
  properties: {
    display: {
      none: { display: 'none' },
      block: { display: 'block' },
      flex: { display: 'flex' },
      'inline-flex': { display: 'inline-flex' },
      grid: { display: 'grid' },
      inline: { display: 'inline' },
    },
    flexDirection: { row: { flexDirection: 'row' }, col: { flexDirection: 'column' } },
    flexWrap: { wrap: { flexWrap: 'wrap' }, nowrap: { flexWrap: 'nowrap' } },
    flex: { '1': { flex: '1 1 0%' }, auto: { flex: 'auto' }, none: { flex: 'none' } },
    flexShrink: { 0: { flexShrink: 0 } },
    flexGrow: { 1: { flexGrow: 1 } },

    alignItems: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      baseline: { alignItems: 'baseline' },
      stretch: { alignItems: 'stretch' },
    },
    justifyContent: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
    },

    gap: { 1: { gap: '4px' }, 2: { gap: '8px' }, 3: { gap: '12px' }, 4: { gap: '16px' }, 6: { gap: '24px' }, 8: { gap: '32px' } },
    columnGap: { 3: { columnGap: '12px' }, 8: { columnGap: '32px' } },
    rowGap: { 0: { rowGap: '0' }, 3: { rowGap: '12px' } },

    gridTemplateColumns: {
      1: { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
      2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
      4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
    },
    gridColumn: { 'span-2': { gridColumn: 'span 2 / span 2' }, 'span-full': { gridColumn: '1 / -1' } },

    width: { 4: { width: '16px' }, 8: { width: '32px' }, 16: { width: '64px' }, 20: { width: '80px' }, 36: { width: '144px' }, 40: { width: '160px' }, 52: { width: '208px' }, 56: { width: '224px' }, 64: { width: '256px' }, 72: { width: '288px' }, full: { width: '100%' }, screen: { width: '100vw' } },
    height: { 3: { height: '12px' }, 8: { height: '32px' }, 9: { height: '36px' }, 10: { height: '40px' }, 12: { height: '48px' }, 14: { height: '56px' }, 24: { height: '96px' }, 32: { height: '128px' }, 40: { height: '160px' }, 44: { height: '176px' }, full: { height: '100%' }, screen: { height: '100vh' } },
    minWidth: { 0: { minWidth: 0 }, full: { minWidth: '100%' } },
    minHeight: { 0: { minHeight: 0 }, full: { minHeight: '100%' }, screen: { minHeight: '100vh' } },
    maxWidth: { md: { maxWidth: '448px' }, xl: { maxWidth: '576px' }, '3xl': { maxWidth: '768px' } },

    padding: { 1: { padding: '4px' }, 2: { padding: '8px' }, 3: { padding: '12px' }, 4: { padding: '16px' }, 5: { padding: '20px' }, 6: { padding: '24px' } },
    paddingLeft: { 1: { paddingLeft: '4px' }, 2: { paddingLeft: '8px' }, 4: { paddingLeft: '16px' } },
    paddingRight: { 1: { paddingRight: '4px' }, 2: { paddingRight: '8px' }, 4: { paddingRight: '16px' } },
    paddingTop: { 0: { paddingTop: '0' }, 1: { paddingTop: '4px' }, 2: { paddingTop: '8px' }, 3: { paddingTop: '12px' }, 4: { paddingTop: '16px' } },
    paddingBottom: { 1: { paddingBottom: '4px' }, 3: { paddingBottom: '12px' }, 5: { paddingBottom: '20px' } },

    marginTop: { 0: { marginTop: '0' }, '0_5': { marginTop: '2px' }, 1: { marginTop: '4px' }, 2: { marginTop: '8px' }, 3: { marginTop: '12px' }, 4: { marginTop: '16px' }, 6: { marginTop: '24px' }, auto: { marginTop: 'auto' } },
    marginBottom: { 0: { marginBottom: '0' }, 1: { marginBottom: '4px' }, 3: { marginBottom: '12px' }, 5: { marginBottom: '20px' } },
    marginLeft: { 1: { marginLeft: '4px' }, 2: { marginLeft: '8px' } },
    marginRight: { 1: { marginRight: '4px' } },

    fontSize: { xs: { fontSize: '12px' }, sm: { fontSize: '14px' }, base: { fontSize: '16px' }, lg: { fontSize: '18px' }, xl: { fontSize: '20px' }, '2xl': { fontSize: '24px' }, '3xl': { fontSize: '30px' } },
    fontWeight: { normal: { fontWeight: '400' }, medium: { fontWeight: '500' }, semibold: { fontWeight: '600' }, bold: { fontWeight: '700' } },
    lineHeight: { none: { lineHeight: 1 }, tight: { lineHeight: 1.25 }, '60': { lineHeight: 60 }, '116': { lineHeight: 116 } },
    letterSpacing: { widest: { letterSpacing: '0.1em' } },
    fontFamily: { mono: { fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace" } },
    fontVariantNumeric: { 'tabular-nums': { fontVariantNumeric: 'tabular-nums' } },
    textAlign: { left: { textAlign: 'left' }, center: { textAlign: 'center' }, right: { textAlign: 'right' } },

    color: {
      primary: { color: 'var(--ant-color-primary)' },
      text: { color: 'var(--ant-color-text)' },
      'text-secondary': { color: 'var(--ant-color-text-secondary)' },
      'text-tertiary': { color: 'var(--ant-color-text-tertiary)' },
      'text-quaternary': { color: 'var(--ant-color-text-quaternary)' },
      success: { color: 'var(--ant-color-success)' },
      warning: { color: 'var(--ant-color-warning)' },
      error: { color: 'var(--ant-color-error)' },
      white: { color: '#fff' },
      'red-ff4d4f': { color: '#ff4d4f' },
      'green-52c41a': { color: '#52c41a' },
      'blue-1677ff': { color: '#1677ff' },
    },

    backgroundColor: {
      layout: { backgroundColor: 'var(--ant-color-bg-layout)' },
      container: { backgroundColor: 'var(--ant-color-bg-container)' },
      elevated: { backgroundColor: 'var(--ant-color-bg-elevated)' },
      primary: { backgroundColor: 'var(--ant-color-primary)' },
      'primary-bg': { backgroundColor: 'var(--ant-color-primary-bg)' },
      'primary-hover': { backgroundColor: 'var(--ant-color-primary-hover)' },
      'fill-secondary': { backgroundColor: 'var(--ant-color-fill-secondary)' },
      'fill-tertiary': { backgroundColor: 'var(--ant-color-fill-tertiary)' },
      'fill-quaternary': { backgroundColor: 'var(--ant-color-fill-quaternary)' },
      transparent: { backgroundColor: 'transparent' },
      'green-light': { backgroundColor: '#f6ffed' },
      'yellow-light': { backgroundColor: '#fffbe6' },
      'red-light': { backgroundColor: '#fff2f0' },
      'primary-85': { backgroundColor: 'rgba(22, 119, 255, 0.85)' },
    },

    borderRadius: {
      none: { borderRadius: '0' },
      sm: { borderRadius: 'var(--ant-border-radius-sm)' },
      base: { borderRadius: 'var(--ant-border-radius)' },
      md: { borderRadius: 'var(--ant-border-radius)' },
      lg: { borderRadius: 'var(--ant-border-radius-lg)' },
      full: { borderRadius: '9999px' },
    },
    borderTopLeftRadius: { 3: { borderTopLeftRadius: '3px' } },
    borderTopRightRadius: { 3: { borderTopRightRadius: '3px' } },
    border: {
      none: { border: 'none' },
      primary: { border: '1px solid var(--ant-color-primary)' },
      antd: { border: '1px solid var(--ant-color-primary-border)' },
      'el-primary': { border: '1px solid var(--el-color-primary)' },
    },
    borderTop: { secondary: { borderTop: '1px solid var(--ant-color-border-secondary)' } },
    borderBottom: { secondary: { borderBottom: '1px solid var(--ant-color-border-secondary)' } },
    borderRight: { secondary: { borderRight: '1px solid var(--ant-color-border-secondary)' } },

    boxShadow: { antd: { boxShadow: 'var(--ant-box-shadow)' }, 'antd-lg': { boxShadow: 'var(--ant-box-shadow-secondary)' } },

    transitionProperty: { all: { transitionProperty: 'all' }, colors: { transitionProperty: 'color, background-color, border-color' }, width: { transitionProperty: 'width' } },
    transitionDuration: { 150: { transitionDuration: '0.15s' }, 200: { transitionDuration: '0.2s' } },
    transitionTimingFunction: { ease: { transitionTimingFunction: 'ease' }, 'cubic-out': { transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' } },
    transition: { all: { transition: 'all 0.2s ease' } },
    overflow: { hidden: { overflow: 'hidden' }, auto: { overflow: 'auto' } },
    overflowY: { auto: { overflowY: 'auto' } },
    cursor: { pointer: { cursor: 'pointer' } },
    textOverflow: { ellipsis: { textOverflow: 'ellipsis' } },
    whiteSpace: { nowrap: { whiteSpace: 'nowrap' } },

    position: { relative: { position: 'relative' }, absolute: { position: 'absolute' }, sticky: { position: 'sticky' }, fixed: { position: 'fixed' } },
  },
  shorthands: {
    px: ['paddingLeft', 'paddingRight'],
    py: ['paddingTop', 'paddingBottom'],
    p: ['padding'],
    mt: ['marginTop'],
    mb: ['marginBottom'],
    ml: ['marginLeft'],
    mr: ['marginRight'],
    pt: ['paddingTop'],
    pb: ['paddingBottom'],
    pl: ['paddingLeft'],
    pr: ['paddingRight'],
    gapX: ['columnGap'],
    gapY: ['rowGap'],
    w: ['width'],
    h: ['height'],
    minW: ['minWidth'],
    minH: ['minHeight'],
    maxW: ['maxWidth'],
    rounded: ['borderRadius'],
    items: ['alignItems'],
    justify: ['justifyContent'],
    flexCol: ['flexDirection'],
    flexRow: ['flexDirection'],
    gridCols: ['gridTemplateColumns'],
    colSpan: ['gridColumn'],
    truncate: ['overflow', 'textOverflow', 'whiteSpace'],
  },
})

/**
 * 主流 API：sprinkles 函数。调用方式：
 *   class={sprinkles({ display: 'flex', padding: '5', gap: '4' })}
 *   class={sprinkles({ display: { mobile: 'none', sm: 'block' }, p: '4' })}
 */
export const sprinkles = createSprinkles(utilities)

// 类型导出：IDE 智能提示
export type Sprinkles = Parameters<typeof sprinkles>[0]

// ============================================================
// 3. style() 风格的兼容垫片
// ------------------------------------------------------------
// 老代码用 `import * as u from '@/styles/utility.css'` 拿一堆预先 style() 出来的
// className；这里继续导出这些名，让 14 个文件无需批量改动。
// 新代码请改用上面的 `sprinkles({ ... })` 写法。
// ============================================================

// ----- display / flex / grid -----
export const flex = style({ display: 'flex' })
export const inlineFlex = style({ display: 'inline-flex' })
export const grid = style({ display: 'grid' })
export const block = style({ display: 'block' })
export const hidden = style({ display: 'none' })

export const flexCol = style({ display: 'flex', flexDirection: 'column' })
export const flexRow = style({ display: 'flex', flexDirection: 'row' })
export const flexWrap = style({ display: 'flex', flexWrap: 'wrap' })
export const flex1 = style({ flex: '1 1 0%' })
export const shrink0 = style({ flexShrink: 0 })

export const itemsCenter = style({ alignItems: 'center' })
export const itemsStart = style({ alignItems: 'flex-start' })
export const itemsEnd = style({ alignItems: 'flex-end' })
export const itemsBaseline = style({ alignItems: 'baseline' })
export const itemsStretch = style({ alignItems: 'stretch' })

export const justifyCenter = style({ justifyContent: 'center' })
export const justifyStart = style({ justifyContent: 'flex-start' })
export const justifyEnd = style({ justifyContent: 'flex-end' })
export const justifyBetween = style({ justifyContent: 'space-between' })

// ----- gap -----
export const gap1 = style({ gap: 4 })
export const gap2 = style({ gap: 8 })
export const gap3 = style({ gap: 12 })
export const gap4 = style({ gap: 16 })
export const gap6 = style({ gap: 24 })

export const gapX3 = style({ columnGap: 12 })
export const gapX8 = style({ columnGap: 32 })
export const gapY0 = style({ rowGap: 0 })
export const gapY3 = style({ rowGap: 12 })

// ----- grid columns -----
export const gridCols1 = style({ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' })
export const gridCols2 = style({ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' })
export const gridCols3 = style({ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' })
export const gridCols4 = style({ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' })

export const xlColSpan2 = style({
  '@media': { 'screen and (min-width: 1280px)': { gridColumn: 'span 2 / span 2' } },
})

// ----- width / height -----
export const wFull = style({ width: '100%' })
export const w4 = style({ width: 16 })
export const w8 = style({ width: 32 })
export const w16 = style({ width: 64 })
export const w20 = style({ width: 80 })
export const w40 = style({ width: 160 })
export const w56 = style({ width: 224 })
export const w72 = style({ width: 288 })
export const w36 = style({ width: 144 })
export const w52 = style({ width: 208 })
export const w64 = style({ width: 256 })

export const hFull = style({ height: '100%' })
export const h3 = style({ height: 12 })
export const h8 = style({ height: 32 })
export const h9 = style({ height: 36 })
export const h10 = style({ height: 40 })
export const h12 = style({ height: 48 })
export const h14 = style({ height: 56 })
export const h24 = style({ height: 96 })
export const h32 = style({ height: 128 })
export const h40 = style({ height: 160 })
export const h44 = style({ height: 176 })

export const size1_5 = style({ width: 6, height: 6 })
export const size4 = style({ width: 16, height: 16 })
export const size8 = style({ width: 32, height: 32 })
export const size9 = style({ width: 36, height: 36 })
export const size10 = style({ width: 40, height: 40 })

export const minW0 = style({ minWidth: 0 })
export const minH0 = style({ minHeight: 0 })
export const minHScreen = style({ minHeight: '100vh' })

// ----- padding -----
export const p1 = style({ padding: 4 })
export const p2 = style({ padding: 8 })
export const p3 = style({ padding: 12 })
export const p4 = style({ padding: 16 })
export const p5 = style({ padding: 20 })
export const p6 = style({ padding: 24 })

export const px2 = style({ paddingLeft: 8, paddingRight: 8 })
export const px3 = style({ paddingLeft: 12, paddingRight: 12 })
export const px4 = style({ paddingLeft: 16, paddingRight: 16 })
export const px5 = style({ paddingLeft: 20, paddingRight: 20 })
export const px6 = style({ paddingLeft: 24, paddingRight: 24 })

export const py1 = style({ paddingTop: 4, paddingBottom: 4 })
export const py2 = style({ paddingTop: 8, paddingBottom: 8 })
export const py3 = style({ paddingTop: 12, paddingBottom: 12 })
export const py5 = style({ paddingTop: 20, paddingBottom: 20 })
export const pb3 = style({ paddingBottom: 12 })

// ----- margin -----
export const mt0 = style({ marginTop: 0 })
export const mt1 = style({ marginTop: 4 })
export const mt2 = style({ marginTop: 8 })
export const mt3 = style({ marginTop: 12 })
export const mt4 = style({ marginTop: 16 })
export const mt6 = style({ marginTop: 24 })
export const mtAuto = style({ marginTop: 'auto' })

export const mt0_5 = style({ marginTop: 2 })

export const mb0 = style({ marginBottom: 0 })
export const mb1 = style({ marginBottom: 4 })
export const mb3 = style({ marginBottom: 12 })

export const mr1 = style({ marginRight: 4 })
export const ml1 = style({ marginLeft: 4 })
export const ml2 = style({ marginLeft: 8 })
export const mx1 = style({ marginLeft: 4, marginRight: 4 })

export const my3 = style({ marginTop: 12, marginBottom: 12 })
export const my5 = style({ marginTop: 20, marginBottom: 20 })

// ----- typography -----
export const textXs = style({ fontSize: 12 })
export const textSm = style({ fontSize: 14 })
export const textBase = style({ fontSize: 16 })
export const textLg = style({ fontSize: 18 })
export const textXl = style({ fontSize: 20 })
export const text2xl = style({ fontSize: 24 })
export const text3xl = style({ fontSize: 30 })

export const fontMono = style({
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
})
export const fontBold = style({ fontWeight: 700 })
export const fontSemibold = style({ fontWeight: 600 })
export const fontMedium = style({ fontWeight: 500 })
export const fontNormal = style({ fontWeight: 400 })

export const leadingNone = style({ lineHeight: 1 })
export const leadingTight = style({ lineHeight: 1.25 })
export const leading60 = style({ lineHeight: 60 })
export const leading116 = style({ lineHeight: 116 })

export const trackingWidest = style({ letterSpacing: '0.1em' })
export const tabularNums = style({ fontVariantNumeric: 'tabular-nums' })

export const textLeft = style({ textAlign: 'left' })
export const textCenter = style({ textAlign: 'center' })
export const textRight = style({ textAlign: 'right' })

// ----- color -----
export const textPrimary = style({ color: 'var(--ant-color-primary)' })
export const textText = style({ color: 'var(--ant-color-text)' })
export const textTextSecondary = style({ color: 'var(--ant-color-text-secondary)' })
export const textTextTertiary = style({ color: 'var(--ant-color-text-tertiary)' })
export const textTextQuaternary = style({ color: 'var(--ant-color-text-quaternary)' })
export const textSuccess = style({ color: 'var(--ant-color-success)' })
export const textWarning = style({ color: 'var(--ant-color-warning)' })
export const textError = style({ color: 'var(--ant-color-error)' })
export const textWhite = style({ color: '#fff' })
export const textRedFF4D4F = style({ color: '#ff4d4f' })
export const textGreen52C41A = style({ color: '#52c41a' })
export const textBlue1677FF = style({ color: '#1677ff' })

export const bgLayout = style({ backgroundColor: 'var(--ant-color-bg-layout)' })
export const bgContainer = style({ backgroundColor: 'var(--ant-color-bg-container)' })
export const bgElevated = style({ backgroundColor: 'var(--ant-color-bg-elevated)' })
export const bgPrimary = style({ backgroundColor: 'var(--ant-color-primary)' })
export const bgPrimaryBg = style({ backgroundColor: 'var(--ant-color-primary-bg)' })
export const bgPrimaryHover = style({ backgroundColor: 'var(--ant-color-primary-hover)' })
export const bgFillSecondary = style({ backgroundColor: 'var(--ant-color-fill-secondary)' })
export const bgFillTertiary = style({ backgroundColor: 'var(--ant-color-fill-tertiary)' })
export const bgFillQuaternary = style({ backgroundColor: 'var(--ant-color-fill-quaternary)' })
export const bgTransparent = style({ backgroundColor: 'transparent' })

export const bgGreenLight = style({ backgroundColor: '#f6ffed' })
export const bgYellowLight = style({ backgroundColor: '#fffbe6' })
export const bgRedLight = style({ backgroundColor: '#fff2f0' })
export const bgPrimary85 = style({ backgroundColor: 'rgba(22, 119, 255, 0.85)' })

export const darkBgGreenDark = style({
  selectors: { '.dark &': { backgroundColor: '#162312' } },
})
export const darkBgYellowDark = style({
  selectors: { '.dark &': { backgroundColor: '#2b2111' } },
})
export const darkBgRedDark = style({
  selectors: { '.dark &': { backgroundColor: '#2c1618' } },
})

export const group = style({})
export const groupHoverTextPrimary = style({
  selectors: {
    '.group:hover &': { color: 'var(--ant-color-primary)' },
  },
})

// ----- border -----
export const border = style({ border: '1px solid var(--ant-color-border)' })
export const borderSecondary = style({ border: '1px solid var(--ant-color-border-secondary)' })
export const borderB = style({ borderBottom: '1px solid var(--ant-color-border-secondary)' })
export const borderT = style({ borderTop: '1px solid var(--ant-color-border-secondary)' })
export const borderR = style({ borderRight: '1px solid var(--ant-color-border-secondary)' })
export const borderPrimary = style({ border: '1px solid var(--ant-color-primary)' })
export const borderPrimaryBorder = style({ border: '1px solid var(--ant-color-primary-border)' })
export const borderNone = style({ border: 'none' })
export const borderAntdPrimary = style({ border: '1px solid var(--el-color-primary)' })

// ----- radius -----
export const rounded = style({ borderRadius: 'var(--ant-border-radius)' })
export const roundedSm = style({ borderRadius: 'var(--ant-border-radius-sm)' })
export const roundedMd = style({ borderRadius: 'var(--ant-border-radius)' })
export const roundedLg = style({ borderRadius: 'var(--ant-border-radius-lg)' })
export const roundedFull = style({ borderRadius: 9999 })
export const roundedT3 = style({
  borderTopLeftRadius: 3,
  borderTopRightRadius: 3,
})

// ----- divide -----
export const divideY = style({})
globalStyle(`${divideY} > :not([hidden]) ~ :not([hidden])`, {
  borderTop: '1px solid var(--ant-color-border-secondary)',
})

// ----- shadow -----
export const shadowAntd = style({ boxShadow: 'var(--ant-box-shadow)' })
export const shadowAntdLg = style({ boxShadow: 'var(--ant-box-shadow-secondary)' })

// ----- transition / overflow / cursor / truncate -----
export const transition = style({ transition: 'all 0.2s ease' })
export const transitionAll = style({ transition: 'all 0.2s ease' })
export const transitionColors = style({
  transitionProperty: 'color, background-color, border-color',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '0.15s',
})
export const transitionWidth = style({
  transitionProperty: 'width',
  transitionDuration: '0.2s',
})

export const overflowHidden = style({ overflow: 'hidden' })
export const overflowYAuto = style({ overflowY: 'auto' })

export const cursorPointer = style({ cursor: 'pointer' })

export const truncate = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

// ----- position / z-index -----
export const relative = style({ position: 'relative' })
export const absolute = style({ position: 'absolute' })
export const sticky = style({ position: 'sticky' })
export const fixed = style({ position: 'fixed' })

// ============================================================
// 8. 语义化组件 recipe —— 多 variant 类型安全的样式函数
// ------------------------------------------------------------
// 每个 recipe 都同时导出：
//   • `xxx` 是 recipe 函数（推荐新代码使用，支持 variants）
//   • `xxxBase` 是基础 className 字符串（供老代码 `u.xxx` 直接使用）
//   • `xxxVariants` 是 RecipeVariants<typeof xxx> 类型，可用于组件 props
//
// recipe 的 variants key 一律走字符串联合（如 size: 'sm' | 'md' | 'lg'），
// 编译期会为每个组合生成独立的 hash class，运行期零开销。
// ============================================================

/**
 * 通用容器 / 布局
 */
export const stackCol = style({
  display: 'flex',
  flexDirection: 'column',
  gap: calc.multiply('var(--space-unit)', 4), // 16px
})
export const inlineRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: calc.multiply('var(--space-unit)', 2), // 8px
})
export const center = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

/**
 * antd 风格卡片 —— size: sm(16px) / md(20px) / lg(24px) 控制内边距
 * hoverable: true 时增加 hover 过渡与边框/阴影变化
 *
 * 内边距使用 calc 表达式（参考 --space-unit），跟随设计令牌缩放。
 */
export const card = recipe({
  base: {
    backgroundColor: 'var(--ant-color-bg-container)',
    border: '1px solid var(--ant-color-border-secondary)',
    borderRadius: 'var(--ant-border-radius-lg)',
    boxShadow: 'var(--ant-box-shadow)',
  },
  variants: {
    size: {
      none: { padding: 0 },
      sm: { padding: calc.multiply('var(--space-unit)', 4) }, //  16px
      md: { padding: calc.multiply('var(--space-unit)', 5) }, //  20px
      lg: { padding: calc.multiply('var(--space-unit)', 6) }, //  24px
    },
    hoverable: {
      true: {
        transition: 'box-shadow 0.2s, border-color 0.2s',
        ':hover': {
          borderColor: 'var(--ant-color-primary-border)',
          boxShadow: 'var(--ant-box-shadow-secondary)',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
export type CardVariants = RecipeVariants<typeof card>

// 兼容垫片：旧 `u.appCard / u.appCardHoverable` 写法
const appCardBaseInner = style({
  backgroundColor: 'var(--ant-color-bg-container)',
  border: '1px solid var(--ant-color-border-secondary)',
  borderRadius: 'var(--ant-border-radius-lg)',
  boxShadow: 'var(--ant-box-shadow)',
})
const appCardHoverableInner = style({
  transition: 'box-shadow 0.2s, border-color 0.2s',
  ':hover': {
    borderColor: 'var(--ant-color-primary-border)',
    boxShadow: 'var(--ant-box-shadow-secondary)',
  },
})
export const appCard = appCardBaseInner
export const appCardHoverable = appCardHoverableInner
// 合体 variant（老代码 `${u.appCard} ${u.appCardHoverable}` 的产物）
// → 直接调用 card({}) + card({ hoverable: true }) 时请改用上方 recipe()

/**
 * 主色按钮 —— 压过 Element Plus 默认风格
 * size: sm / md 控制 height / padding，block: true 全宽
 *
 * height / padding 用 calc 表达式跟随 --space-unit 缩放。
 */
export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: 'var(--ant-border-radius)',
    backgroundColor: 'var(--ant-color-primary)',
    borderColor: 'var(--ant-color-primary)',
    color: '#fff',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'var(--ant-color-primary-hover)',
      borderColor: 'var(--ant-color-primary-hover)',
      color: '#fff',
    },
    ':active': {
      backgroundColor: 'var(--ant-color-primary-active)',
      borderColor: 'var(--ant-color-primary-active)',
      color: '#fff',
    },
  },
  variants: {
    size: {
      sm: {
        height: calc.multiply('var(--space-unit)', 6), // 24px
        padding: `0 ${calc.multiply('var(--space-unit)', 3)}`, // 0 12px
        fontSize: 14,
      },
      md: {
        height: calc.multiply('var(--space-unit)', 8), // 32px
        padding: `0 ${calc.multiply('var(--space-unit)', 4)}`, // 0 16px
        fontSize: 14,
      },
      lg: {
        height: calc.multiply('var(--space-unit)', 10), // 40px
        padding: `0 ${calc.multiply('var(--space-unit)', 5)}`, // 0 20px
        fontSize: 16,
      },
    },
    block: {
      true: { width: '100%' },
    },
  },
  defaultVariants: { size: 'md' },
})
export type ButtonVariants = RecipeVariants<typeof button>

// 兼容垫片
export const antdPrimaryBtn = style({
  backgroundColor: 'var(--ant-color-primary)',
  borderColor: 'var(--ant-color-primary)',
  color: '#fff',
  ':hover': {
    backgroundColor: 'var(--ant-color-primary-hover)',
    borderColor: 'var(--ant-color-primary-hover)',
    color: '#fff',
  },
  ':active': {
    backgroundColor: 'var(--ant-color-primary-active)',
    borderColor: 'var(--ant-color-primary-active)',
    color: '#fff',
  },
})

/**
 * 图标按钮（顶栏圆形按钮） —— size 控制按钮宽高
 *
 * 宽高跟随 --space-unit，便于适配全局 spacing 调整。
 */
export const iconBtn = recipe({
  base: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--ant-border-radius)',
    color: 'var(--ant-color-text-secondary)',
    transition: 'color 0.15s, background-color 0.15s',
    ':hover': {
      backgroundColor: 'var(--ant-color-fill-tertiary)',
      color: 'var(--ant-color-text)',
    },
  },
  variants: {
    size: {
      sm: {
        width: calc.multiply('var(--space-unit)', 6),
        height: calc.multiply('var(--space-unit)', 6),
      },
      md: {
        width: calc.multiply('var(--space-unit)', 8),
        height: calc.multiply('var(--space-unit)', 8),
      },
      lg: {
        width: calc.multiply('var(--space-unit)', 10),
        height: calc.multiply('var(--space-unit)', 10),
      },
    },
  },
  defaultVariants: { size: 'md' },
})
export type IconBtnVariants = RecipeVariants<typeof iconBtn>

// 兼容垫片
export const iconButton = style({
  display: 'flex',
  width: 32,
  height: 32,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  color: 'var(--ant-color-text-secondary)',
  transition: 'color 0.15s, background-color 0.15s',
  ':hover': {
    backgroundColor: 'var(--ant-color-fill-tertiary)',
    color: 'var(--ant-color-text)',
  },
})

/**
 * 用户下拉触发器
 */
export const userMenu = recipe({
  base: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    gap: calc.multiply('var(--space-unit)', 2), // 8px
    padding: `${calc.multiply('var(--space-unit)', 1)} ${calc.multiply('var(--space-unit)', 2)}`, // 4px 8px
    borderRadius: 'var(--ant-border-radius)',
    transition: 'background-color 0.15s',
    ':hover': {
      backgroundColor: 'var(--ant-color-fill-tertiary)',
    },
  },
  variants: {
    padded: {
      true: {
        padding: `${calc.multiply('var(--space-unit)', 1.5)} ${calc.multiply('var(--space-unit)', 3)}`, // 6px 12px
      },
      false: { padding: 0 },
    },
  },
})
export type UserMenuVariants = RecipeVariants<typeof userMenu>

// 兼容垫片
export const userTrigger = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: 8,
  padding: '4px 8px',
  borderRadius: 'var(--ant-border-radius)',
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: 'var(--ant-color-fill-tertiary)',
  },
})

/**
 * Logo 块 —— tone 控制主色，size 控制尺寸
 */
export const logoBox = recipe({
  base: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--ant-border-radius)',
    fontWeight: 700,
    color: '#fff',
  },
  variants: {
    tone: {
      primary: { backgroundColor: 'var(--ant-color-primary)' },
      dark: { backgroundColor: 'var(--ant-color-text)' },
      light: {
        backgroundColor: 'var(--ant-color-bg-container)',
        color: 'var(--ant-color-primary)',
        border: '1px solid var(--ant-color-primary-border)',
      },
    },
    size: {
      sm: {
        width: calc.multiply('var(--space-unit)', 6), // 24px
        height: calc.multiply('var(--space-unit)', 6),
        fontSize: 12,
      },
      md: {
        width: calc.multiply('var(--space-unit)', 8), // 32px
        height: calc.multiply('var(--space-unit)', 8),
        fontSize: 16,
      },
      lg: {
        width: calc.multiply('var(--space-unit)', 10), // 40px
        height: calc.multiply('var(--space-unit)', 10),
        fontSize: 20,
      },
    },
  },
  defaultVariants: { tone: 'primary', size: 'md' },
})
export type LogoBoxVariants = RecipeVariants<typeof logoBox>

// 兼容垫片
export const logoBlock = style({
  display: 'flex',
  width: 32,
  height: 32,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  backgroundColor: 'var(--ant-color-primary)',
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
})

/**
 * 快捷入口卡片（仪表盘）
 */
export const shortcut = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: calc.multiply('var(--space-unit)', 2), // 8px
    padding: `${calc.multiply('var(--space-unit)', 3)} ${calc.multiply('var(--space-unit)', 4)}`, // 12px 16px
    border: '1px solid var(--ant-color-border-secondary)',
    borderRadius: 'var(--ant-border-radius)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
    ':hover': {
      borderColor: 'var(--ant-color-primary-border)',
      backgroundColor: 'var(--ant-color-primary-bg)',
    },
  },
  variants: {
    active: {
      true: {
        borderColor: 'var(--ant-color-primary)',
        backgroundColor: 'var(--ant-color-primary-bg)',
      },
    },
    size: {
      sm: {
        padding: `${calc.multiply('var(--space-unit)', 2)} ${calc.multiply('var(--space-unit)', 3)}`, // 8px 12px
      },
      md: {
        padding: `${calc.multiply('var(--space-unit)', 3)} ${calc.multiply('var(--space-unit)', 4)}`, // 12px 16px
      },
    },
  },
  defaultVariants: { size: 'md' },
})
export type ShortcutVariants = RecipeVariants<typeof shortcut>

// 兼容垫片
export const shortcutCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '12px 16px',
  border: '1px solid var(--ant-color-border-secondary)',
  borderRadius: 'var(--ant-border-radius)',
  transition: 'border-color 0.2s, background-color 0.2s',
  ':hover': {
    borderColor: 'var(--ant-color-primary-border)',
    backgroundColor: 'var(--ant-color-primary-bg)',
  },
})

/**
 * 仪表盘趋势图柱条 —— tone 控制 hover 后的色
 */
export const bar = recipe({
  base: {
    flex: '1 1 0%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: 'rgba(22, 119, 255, 0.85)',
    transition: 'background-color 0.2s',
  },
  variants: {
    tone: {
      primary: {
        ':hover': { backgroundColor: 'var(--ant-color-primary)' },
      },
      success: {
        backgroundColor: 'rgba(82, 196, 26, 0.85)',
        ':hover': { backgroundColor: 'var(--ant-color-success)' },
      },
      warning: {
        backgroundColor: 'rgba(250, 173, 20, 0.85)',
        ':hover': { backgroundColor: 'var(--ant-color-warning)' },
      },
    },
  },
  defaultVariants: { tone: 'primary' },
})
export type BarVariants = RecipeVariants<typeof bar>

// 兼容垫片
export const trendBar = style({
  flex: '1 1 0%',
  borderTopLeftRadius: 3,
  borderTopRightRadius: 3,
  backgroundColor: 'rgba(22, 119, 255, 0.85)',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: 'var(--ant-color-primary)',
  },
})

/**
 * 时间线 / 通知圆点 —— tone 控制颜色
 */
export const dot = recipe({
  base: {
    marginTop: calc.multiply('var(--space-unit)', 1.5), // 6px
    width: calc.multiply('var(--space-unit)', 1.5),
    height: calc.multiply('var(--space-unit)', 1.5),
    flexShrink: 0,
    borderRadius: 9999,
  },
  variants: {
    tone: {
      primary: { backgroundColor: 'var(--ant-color-primary)' },
      success: { backgroundColor: 'var(--ant-color-success)' },
      warning: { backgroundColor: 'var(--ant-color-warning)' },
      error: { backgroundColor: 'var(--ant-color-error)' },
      neutral: { backgroundColor: 'var(--ant-color-text-tertiary)' },
    },
    size: {
      sm: {
        width: calc.multiply('var(--space-unit)', 1),
        height: calc.multiply('var(--space-unit)', 1),
      },
      md: {
        width: calc.multiply('var(--space-unit)', 1.5),
        height: calc.multiply('var(--space-unit)', 1.5),
      },
      lg: {
        width: calc.multiply('var(--space-unit)', 2),
        height: calc.multiply('var(--space-unit)', 2),
      },
    },
  },
  defaultVariants: { tone: 'primary', size: 'md' },
})
export type DotVariants = RecipeVariants<typeof dot>

// 兼容垫片
export const activityDot = style({
  marginTop: 6,
  width: 6,
  height: 6,
  flexShrink: 0,
  borderRadius: 9999,
  backgroundColor: 'var(--ant-color-primary)',
})

/**
 * 趋势方向（涨/跌） —— 配 StatCard 用
 */
export const trend = recipe({
  base: { display: 'inline-flex', alignItems: 'center', gap: 2 },
  variants: {
    direction: {
      up: { color: '#ff4d4f' },
      down: { color: '#52c41a' },
      flat: { color: 'var(--ant-color-text-tertiary)' },
    },
  },
  defaultVariants: { direction: 'up' },
})
export type TrendVariants = RecipeVariants<typeof trend>

// 兼容垫片
export const trendUp = style({ color: '#ff4d4f' })
export const trendDown = style({ color: '#52c41a' })

export const importantWFull = style({ width: '100% !important' })
export const importantGapY0 = style({ rowGap: '0 !important' })
export const importantMy5 = style({
  marginTop: '20px !important',
  marginBottom: '20px !important',
})
export const importantW40 = style({ width: '160px !important' })
export const importantW52 = style({ width: '208px !important' })
export const importantW64 = style({ width: '256px !important' })
export const importantW72 = style({ width: '288px !important' })
export const importantMr1 = style({ marginRight: '4px !important' })

export const borderDashed = style({
  borderStyle: 'dashed',
  borderColor: 'var(--ant-color-border)',
})
export const borderDashedPrimary = style({
  borderStyle: 'dashed',
  borderColor: 'var(--ant-color-primary)',
})

export const hoverBorderPrimary = style({
  ':hover': { borderColor: 'var(--ant-color-primary)' },
})
export const hoverBorderPrimaryBorder = style({
  ':hover': { borderColor: 'var(--ant-color-primary-border)' },
})
export const hoverTextPrimary = style({
  ':hover': { color: 'var(--ant-color-primary)' },
})

// ----- 响应式（兼容垫片）-----
export const smGridCols2 = style({
  '@media': {
    'screen and (min-width: 640px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
})
export const smGridCols3 = style({
  '@media': {
    'screen and (min-width: 640px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
})
export const smFlexRow = style({
  '@media': { 'screen and (min-width: 640px)': { flexDirection: 'row' } },
})
export const xlGridCols3 = style({
  '@media': {
    'screen and (min-width: 1280px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
})
export const xlGridCols4 = style({
  '@media': {
    'screen and (min-width: 1280px)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  },
})
export const smBlock = style({
  '@media': { 'screen and (min-width: 640px)': { display: 'block' } },
})
export const maxW3xl = style({ maxWidth: 768 })
export const maxWmd = style({ maxWidth: 448 })
export const maxWxl = style({ maxWidth: 576 })