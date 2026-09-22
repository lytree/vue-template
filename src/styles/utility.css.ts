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
import { assignVars, createGlobalTheme, createVar, globalStyle, keyframes, style } from '@vanilla-extract/css'
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
// 1. sprinkles conditions —— 响应式（对齐 Tailwind v4 断点）
// ------------------------------------------------------------
// 响应式断点：
//   sm  640px   / md  768px  / lg  1024px / xl 1280px / 2xl 1536px
//
// 注意：sprinkles 的 `conditions` 类型要求每个值是 `Condition` 对象
//   （即 `Partial<Record<'@media' | '@container' | ..., string>>`）。
// 不支持 `selectors` —— 因为 sprinkles 期望 `@media`，而非 `.dark &`。
// 因此 dark mode 用 style() 兼容垫片（darkBgPrimary / darkTextPrimary ...）。
// 伪类变体同理：用单独的 interactiveStyles（hoverTextPrimary / focusBorderPrimary ...）。
// ============================================================
const responsiveConditions = {
  mobile: {},
  sm: { '@media': 'screen and (min-width: 640px)' },
  md: { '@media': 'screen and (min-width: 768px)' },
  lg: { '@media': 'screen and (min-width: 1024px)' },
  xl: { '@media': 'screen and (min-width: 1280px)' },
  '2xl': { '@media': 'screen and (min-width: 1536px)' },
} as const

// ============================================================
// 2. sprinkles 配置 —— 新代码统一从这里拿工具类
// ------------------------------------------------------------
// 对齐 Tailwind v4 + UnoCSS preset-wind4 的核心原子类。
// 涵盖：display / flex / grid / spacing / sizing / typography
//       color / background / border / radius / shadow
//       transform / filter / ring / animation / position
// ============================================================

/**
 * 动画 keyframes —— 在 utilities 之前定义，供 animation property 引用
 */
const spinKf = keyframes({
  to: { transform: 'rotate(360deg)' },
})
const pingKf = keyframes({
  '75%, 100%': { transform: 'scale(2)', opacity: '0' },
})
const pulseKf = keyframes({
  '0%, 100%': { opacity: '1' },
  '50%': { opacity: '0.5' },
})
const bounceKf = keyframes({
  '0%, 100%': {
    transform: 'translateY(-25%)',
    animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
  },
  '50%': {
    transform: 'none',
    animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
  },
})

const utilities = defineProperties({
  conditions: responsiveConditions,
  defaultCondition: 'mobile',
  properties: {
    // ==================== display ====================
    display: {
      none: { display: 'none' },
      block: { display: 'block' },
      'inline-block': { display: 'inline-block' },
      flex: { display: 'flex' },
      'inline-flex': { display: 'inline-flex' },
      grid: { display: 'grid' },
      'inline-grid': { display: 'inline-grid' },
      inline: { display: 'inline' },
      table: { display: 'table' },
      contents: { display: 'contents' },
    },
    visibility: { visible: { visibility: 'visible' }, hidden: { visibility: 'hidden' } },
    opacity: { 0: { opacity: '0' }, 5: { opacity: '0.05' }, 10: { opacity: '0.1' }, 20: { opacity: '0.2' }, 25: { opacity: '0.25' }, 30: { opacity: '0.3' }, 40: { opacity: '0.4' }, 50: { opacity: '0.5' }, 60: { opacity: '0.6' }, 70: { opacity: '0.7' }, 75: { opacity: '0.75' }, 80: { opacity: '0.8' }, 90: { opacity: '0.9' }, 95: { opacity: '0.95' }, 100: { opacity: '1' } },

    // ==================== flex / grid ====================
    flexDirection: { row: { flexDirection: 'row' }, 'row-reverse': { flexDirection: 'row-reverse' }, col: { flexDirection: 'column' }, 'col-reverse': { flexDirection: 'column-reverse' } },
    flexWrap: { wrap: { flexWrap: 'wrap' }, 'wrap-reverse': { flexWrap: 'wrap-reverse' }, nowrap: { flexWrap: 'nowrap' } },
    flex: { '1': { flex: '1 1 0%' }, auto: { flex: 'auto' }, none: { flex: 'none' }, initial: { flex: '0 1 auto' } },
    flexShrink: { 0: { flexShrink: 0 }, 1: { flexShrink: 1 } },
    flexGrow: { 0: { flexGrow: 0 }, 1: { flexGrow: 1 } },
    order: { first: { order: '-9999' }, last: { order: '9999' }, none: { order: '0' }, 1: { order: '1' }, 2: { order: '2' }, 3: { order: '3' } },

    alignItems: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      baseline: { alignItems: 'baseline' },
      stretch: { alignItems: 'stretch' },
    },
    alignSelf: { auto: { alignSelf: 'auto' }, start: { alignSelf: 'flex-start' }, center: { alignSelf: 'center' }, end: { alignSelf: 'flex-end' }, stretch: { alignSelf: 'stretch' } },
    justifyContent: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },
    justifyItems: { start: { justifyItems: 'start' }, center: { justifyItems: 'center' }, end: { justifyItems: 'end' }, stretch: { justifyItems: 'stretch' } },
    justifySelf: { auto: { justifySelf: 'auto' }, start: { justifySelf: 'start' }, center: { justifySelf: 'center' }, end: { justifySelf: 'end' }, stretch: { justifySelf: 'stretch' } },
    placeContent: { start: { placeContent: 'start' }, center: { placeContent: 'center' }, end: { placeContent: 'end' }, between: { placeContent: 'space-between' }, around: { placeContent: 'space-around' }, evenly: { placeContent: 'space-evenly' }, stretch: { placeContent: 'stretch' } },
    placeItems: { start: { placeItems: 'start' }, center: { placeItems: 'center' }, end: { placeItems: 'end' }, stretch: { placeItems: 'stretch' } },

    // ==================== gap ====================
    gap: { 0: { gap: '0' }, px: { gap: '1px' }, '0_5': { gap: '2px' }, 1: { gap: '4px' }, 1.5: { gap: '6px' }, 2: { gap: '8px' }, 3: { gap: '12px' }, 4: { gap: '16px' }, 5: { gap: '20px' }, 6: { gap: '24px' }, 8: { gap: '32px' }, 10: { gap: '40px' }, 12: { gap: '48px' } },
    columnGap: { 0: { columnGap: '0' }, 1: { columnGap: '4px' }, 2: { columnGap: '8px' }, 3: { columnGap: '12px' }, 4: { columnGap: '16px' }, 6: { columnGap: '24px' }, 8: { columnGap: '32px' } },
    rowGap: { 0: { rowGap: '0' }, 1: { rowGap: '4px' }, 2: { rowGap: '8px' }, 3: { rowGap: '12px' }, 4: { rowGap: '16px' }, 6: { rowGap: '24px' }, 8: { rowGap: '32px' } },

    // ==================== grid ====================
    gridTemplateColumns: {
      1: { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
      2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
      4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
      5: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
      6: { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
      none: { gridTemplateColumns: 'none' },
    },
    gridTemplateRows: {
      1: { gridTemplateRows: 'repeat(1, minmax(0, 1fr))' },
      2: { gridTemplateRows: 'repeat(2, minmax(0, 1fr))' },
      3: { gridTemplateRows: 'repeat(3, minmax(0, 1fr))' },
      4: { gridTemplateRows: 'repeat(4, minmax(0, 1fr))' },
      6: { gridTemplateRows: 'repeat(6, minmax(0, 1fr))' },
      none: { gridTemplateRows: 'none' },
    },
    gridColumn: { auto: { gridColumn: 'auto' }, 'span-2': { gridColumn: 'span 2 / span 2' }, 'span-3': { gridColumn: 'span 3 / span 3' }, 'span-4': { gridColumn: 'span 4 / span 4' }, 'span-full': { gridColumn: '1 / -1' } },
    gridRow: { auto: { gridRow: 'auto' }, 'span-2': { gridRow: 'span 2 / span 2' }, 'span-full': { gridRow: '1 / -1' } },
    gridAutoFlow: { row: { gridAutoFlow: 'row' }, col: { gridAutoFlow: 'column' }, dense: { gridAutoFlow: 'dense' } },

    // ==================== sizing ====================
    width: { auto: { width: 'auto' }, full: { width: '100%' }, screen: { width: '100vw' }, min: { width: 'min-content' }, max: { width: 'max-content' }, fit: { width: 'fit-content' }, 4: { width: '16px' }, 8: { width: '32px' }, 12: { width: '48px' }, 16: { width: '64px' }, 20: { width: '80px' }, 24: { width: '96px' }, 32: { width: '128px' }, 36: { width: '144px' }, 40: { width: '160px' }, 48: { width: '192px' }, 52: { width: '208px' }, 56: { width: '224px' }, 64: { width: '256px' }, 72: { width: '288px' }, '1/2': { width: '50%' }, '1/3': { width: '33.333333%' }, '2/3': { width: '66.666667%' }, '1/4': { width: '25%' }, '3/4': { width: '75%' } },
    height: { auto: { height: 'auto' }, full: { height: '100%' }, screen: { height: '100vh' }, min: { height: 'min-content' }, max: { height: 'max-content' }, fit: { height: 'fit-content' }, 3: { height: '12px' }, 4: { height: '16px' }, 6: { height: '24px' }, 8: { height: '32px' }, 9: { height: '36px' }, 10: { height: '40px' }, 12: { height: '48px' }, 14: { height: '56px' }, 16: { height: '64px' }, 20: { height: '80px' }, 24: { height: '96px' }, 32: { height: '128px' }, 40: { height: '160px' }, 44: { height: '176px' }, 48: { height: '192px' }, 56: { height: '224px' }, 64: { height: '256px' }, '1/2': { height: '50%' }, '1/3': { height: '33.333333%' }, '2/3': { height: '66.666667%' } },
    minWidth: { 0: { minWidth: '0' }, full: { minWidth: '100%' }, min: { minWidth: 'min-content' }, max: { minWidth: 'max-content' } },
    minHeight: { 0: { minHeight: '0' }, full: { minHeight: '100%' }, screen: { minHeight: '100vh' }, min: { minHeight: 'min-content' }, max: { minHeight: 'max-content' } },
    maxWidth: { 0: { maxWidth: '0' }, xs: { maxWidth: '320px' }, sm: { maxWidth: '384px' }, md: { maxWidth: '448px' }, lg: { maxWidth: '512px' }, xl: { maxWidth: '576px' }, '2xl': { maxWidth: '672px' }, '3xl': { maxWidth: '768px' }, '4xl': { maxWidth: '896px' }, '5xl': { maxWidth: '1024px' }, '6xl': { maxWidth: '1152px' }, '7xl': { maxWidth: '1280px' }, full: { maxWidth: '100%' }, none: { maxWidth: 'none' } },
    maxHeight: { full: { maxHeight: '100%' }, screen: { maxHeight: '100vh' }, 0: { maxHeight: '0' }, none: { maxHeight: 'none' } },
    aspectRatio: { auto: { aspectRatio: 'auto' }, square: { aspectRatio: '1 / 1' }, video: { aspectRatio: '16 / 9' } },

    // ==================== padding ====================
    padding: { 0: { padding: '0' }, px: { padding: '1px' }, '0_5': { padding: '2px' }, 1: { padding: '4px' }, 1.5: { padding: '6px' }, 2: { padding: '8px' }, 3: { padding: '12px' }, 4: { padding: '16px' }, 5: { padding: '20px' }, 6: { padding: '24px' }, 8: { padding: '32px' }, 10: { padding: '40px' }, 12: { padding: '48px' } },
    paddingLeft: { 0: { paddingLeft: '0' }, px: { paddingLeft: '1px' }, 1: { paddingLeft: '4px' }, 2: { paddingLeft: '8px' }, 3: { paddingLeft: '12px' }, 4: { paddingLeft: '16px' }, 6: { paddingLeft: '24px' }, 8: { paddingLeft: '32px' }, auto: { paddingLeft: 'auto' } },
    paddingRight: { 0: { paddingRight: '0' }, px: { paddingRight: '1px' }, 1: { paddingRight: '4px' }, 2: { paddingRight: '8px' }, 3: { paddingRight: '12px' }, 4: { paddingRight: '16px' }, 6: { paddingRight: '24px' }, 8: { paddingRight: '32px' }, auto: { paddingRight: 'auto' } },
    paddingTop: { 0: { paddingTop: '0' }, px: { paddingTop: '1px' }, 1: { paddingTop: '4px' }, 2: { paddingTop: '8px' }, 3: { paddingTop: '12px' }, 4: { paddingTop: '16px' }, 6: { paddingTop: '24px' }, 8: { paddingTop: '32px' } },
    paddingBottom: { 0: { paddingBottom: '0' }, px: { paddingBottom: '1px' }, 1: { paddingBottom: '4px' }, 2: { paddingBottom: '8px' }, 3: { paddingBottom: '12px' }, 4: { paddingBottom: '16px' }, 6: { paddingBottom: '24px' }, 8: { paddingBottom: '32px' } },

    // ==================== margin ====================
    marginTop: { 0: { marginTop: '0' }, px: { marginTop: '1px' }, '0_5': { marginTop: '2px' }, 1: { marginTop: '4px' }, 1.5: { marginTop: '6px' }, 2: { marginTop: '8px' }, 3: { marginTop: '12px' }, 4: { marginTop: '16px' }, 6: { marginTop: '24px' }, 8: { marginTop: '32px' }, auto: { marginTop: 'auto' } },
    marginBottom: { 0: { marginBottom: '0' }, px: { marginBottom: '1px' }, 1: { marginBottom: '4px' }, 2: { marginBottom: '8px' }, 3: { marginBottom: '12px' }, 4: { marginBottom: '16px' }, 6: { marginBottom: '24px' }, 8: { marginBottom: '32px' }, auto: { marginBottom: 'auto' } },
    marginLeft: { 0: { marginLeft: '0' }, px: { marginLeft: '1px' }, 1: { marginLeft: '4px' }, 2: { marginLeft: '8px' }, 3: { marginLeft: '12px' }, 4: { marginLeft: '16px' }, 6: { marginLeft: '24px' }, 8: { marginLeft: '32px' }, auto: { marginLeft: 'auto' } },
    marginRight: { 0: { marginRight: '0' }, px: { marginRight: '1px' }, 1: { marginRight: '4px' }, 2: { marginRight: '8px' }, 3: { marginRight: '12px' }, 4: { marginRight: '16px' }, 6: { marginRight: '24px' }, 8: { marginRight: '32px' }, auto: { marginRight: 'auto' } },

    // ==================== typography ====================
    fontSize: { xs: { fontSize: '12px' }, sm: { fontSize: '14px' }, base: { fontSize: '16px' }, lg: { fontSize: '18px' }, xl: { fontSize: '20px' }, '2xl': { fontSize: '24px' }, '3xl': { fontSize: '30px' }, '4xl': { fontSize: '36px' }, '5xl': { fontSize: '48px' }, '6xl': { fontSize: '60px' } },
    fontWeight: { thin: { fontWeight: '100' }, extralight: { fontWeight: '200' }, light: { fontWeight: '300' }, normal: { fontWeight: '400' }, medium: { fontWeight: '500' }, semibold: { fontWeight: '600' }, bold: { fontWeight: '700' }, extrabold: { fontWeight: '800' }, black: { fontWeight: '900' } },
    lineHeight: { none: { lineHeight: '1' }, tight: { lineHeight: '1.25' }, snug: { lineHeight: '1.375' }, normal: { lineHeight: '1.5' }, relaxed: { lineHeight: '1.625' }, loose: { lineHeight: '2' }, '60': { lineHeight: '60px' }, '116': { lineHeight: '116px' } },
    letterSpacing: { tighter: { letterSpacing: '-0.05em' }, tight: { letterSpacing: '-0.025em' }, normal: { letterSpacing: '0' }, wide: { letterSpacing: '0.025em' }, wider: { letterSpacing: '0.05em' }, widest: { letterSpacing: '0.1em' } },
    fontFamily: { sans: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }, serif: { fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }, mono: { fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace" } },
    fontVariantNumeric: { normal: { fontVariantNumeric: 'normal' }, 'tabular-nums': { fontVariantNumeric: 'tabular-nums' } },
    fontStyle: { italic: { fontStyle: 'italic' }, not: { fontStyle: 'normal' } },
    textAlign: { left: { textAlign: 'left' }, center: { textAlign: 'center' }, right: { textAlign: 'right' }, justify: { textAlign: 'justify' }, start: { textAlign: 'start' }, end: { textAlign: 'end' } },
    textTransform: { uppercase: { textTransform: 'uppercase' }, lowercase: { textTransform: 'lowercase' }, capitalize: { textTransform: 'capitalize' }, 'normal-case': { textTransform: 'none' } },
    textDecoration: { underline: { textDecoration: 'underline' }, 'line-through': { textDecoration: 'line-through' }, none: { textDecoration: 'none' } },
    textOverflow: { ellipsis: { textOverflow: 'ellipsis' }, clip: { textOverflow: 'clip' } },
    whiteSpace: { nowrap: { whiteSpace: 'nowrap' }, normal: { whiteSpace: 'normal' }, pre: { whiteSpace: 'pre' }, 'pre-wrap': { whiteSpace: 'pre-wrap' }, 'pre-line': { whiteSpace: 'pre-line' }, 'break-spaces': { whiteSpace: 'break-spaces' } },
    wordBreak: { normal: { wordBreak: 'normal' }, break: { wordBreak: 'break-all' }, keep: { wordBreak: 'keep-all' } },
    overflowWrap: { normal: { overflowWrap: 'normal' }, break: { overflowWrap: 'break-word' }, anywhere: { overflowWrap: 'anywhere' } },

    // ==================== color ====================
    color: {
      primary: { color: 'var(--ant-color-primary)' },
      text: { color: 'var(--ant-color-text)' },
      'text-secondary': { color: 'var(--ant-color-text-secondary)' },
      'text-tertiary': { color: 'var(--ant-color-text-tertiary)' },
      'text-quaternary': { color: 'var(--ant-color-text-quaternary)' },
      success: { color: 'var(--ant-color-success)' },
      warning: { color: 'var(--ant-color-warning)' },
      error: { color: 'var(--ant-color-error)' },
      info: { color: 'var(--ant-color-info)' },
      white: { color: '#fff' },
      black: { color: '#000' },
      transparent: { color: 'transparent' },
      current: { color: 'currentColor' },
      inherit: { color: 'inherit' },
      'red-ff4d4f': { color: '#ff4d4f' },
      'green-52c41a': { color: '#52c41a' },
      'blue-1677ff': { color: '#1677ff' },
    },

    // ==================== background ====================
    backgroundColor: {
      layout: { backgroundColor: 'var(--ant-color-bg-layout)' },
      container: { backgroundColor: 'var(--ant-color-bg-container)' },
      elevated: { backgroundColor: 'var(--ant-color-bg-elevated)' },
      primary: { backgroundColor: 'var(--ant-color-primary)' },
      'primary-bg': { backgroundColor: 'var(--ant-color-primary-bg)' },
      'primary-hover': { backgroundColor: 'var(--ant-color-primary-hover)' },
      'primary-active': { backgroundColor: 'var(--ant-color-primary-active)' },
      'fill-secondary': { backgroundColor: 'var(--ant-color-fill-secondary)' },
      'fill-tertiary': { backgroundColor: 'var(--ant-color-fill-tertiary)' },
      'fill-quaternary': { backgroundColor: 'var(--ant-color-fill-quaternary)' },
      transparent: { backgroundColor: 'transparent' },
      black: { backgroundColor: '#000' },
      white: { backgroundColor: '#fff' },
      current: { backgroundColor: 'currentColor' },
      'green-light': { backgroundColor: '#f6ffed' },
      'yellow-light': { backgroundColor: '#fffbe6' },
      'red-light': { backgroundColor: '#fff2f0' },
      'primary-85': { backgroundColor: 'rgba(22, 119, 255, 0.85)' },
    },

    // ==================== border ====================
    borderRadius: {
      none: { borderRadius: '0' },
      xs: { borderRadius: '2px' },
      sm: { borderRadius: 'var(--ant-border-radius-sm)' },
      base: { borderRadius: 'var(--ant-border-radius)' },
      md: { borderRadius: 'var(--ant-border-radius)' },
      lg: { borderRadius: 'var(--ant-border-radius-lg)' },
      xl: { borderRadius: '12px' },
      '2xl': { borderRadius: '16px' },
      '3xl': { borderRadius: '24px' },
      full: { borderRadius: '9999px' },
    },
    borderTopLeftRadius: { none: { borderTopLeftRadius: '0' }, sm: { borderTopLeftRadius: '2px' }, md: { borderTopLeftRadius: '6px' }, lg: { borderTopLeftRadius: '8px' }, full: { borderTopLeftRadius: '9999px' } },
    borderTopRightRadius: { none: { borderTopRightRadius: '0' }, sm: { borderTopRightRadius: '2px' }, md: { borderTopRightRadius: '6px' }, lg: { borderTopRightRadius: '8px' }, full: { borderTopRightRadius: '9999px' } },
    borderBottomLeftRadius: { none: { borderBottomLeftRadius: '0' }, sm: { borderBottomLeftRadius: '2px' }, md: { borderBottomLeftRadius: '6px' }, lg: { borderBottomLeftRadius: '8px' }, full: { borderBottomLeftRadius: '9999px' } },
    borderBottomRightRadius: { none: { borderBottomRightRadius: '0' }, sm: { borderBottomRightRadius: '2px' }, md: { borderBottomRightRadius: '6px' }, lg: { borderBottomRightRadius: '8px' }, full: { borderBottomRightRadius: '9999px' } },
    borderWidth: { 0: { borderWidth: '0' }, 1: { borderWidth: '1px' }, 2: { borderWidth: '2px' }, 4: { borderWidth: '4px' }, 8: { borderWidth: '8px' } },
    borderStyle: { solid: { borderStyle: 'solid' }, dashed: { borderStyle: 'dashed' }, dotted: { borderStyle: 'dotted' }, double: { borderStyle: 'double' }, none: { borderStyle: 'none' }, hidden: { borderStyle: 'hidden' } },
    border: {
      none: { border: 'none' },
      primary: { border: '1px solid var(--ant-color-primary)' },
      antd: { border: '1px solid var(--ant-color-primary-border)' },
      'el-primary': { border: '1px solid var(--el-color-primary)' },
    },
    borderTop: { secondary: { borderTop: '1px solid var(--ant-color-border-secondary)' } },
    borderBottom: { secondary: { borderBottom: '1px solid var(--ant-color-border-secondary)' } },
    borderRight: { secondary: { borderRight: '1px solid var(--ant-color-border-secondary)' } },
    borderLeft: { secondary: { borderLeft: '1px solid var(--ant-color-border-secondary)' } },
    borderColor: { transparent: { borderColor: 'transparent' }, primary: { borderColor: 'var(--ant-color-primary)' }, current: { borderColor: 'currentColor' }, inherit: { borderColor: 'inherit' } },
    outlineStyle: { none: { outlineStyle: 'none' }, solid: { outlineStyle: 'solid' }, dashed: { outlineStyle: 'dashed' }, dotted: { outlineStyle: 'dotted' }, double: { outlineStyle: 'double' } },
    outlineWidth: { 0: { outlineWidth: '0' }, 1: { outlineWidth: '1px' }, 2: { outlineWidth: '2px' }, 4: { outlineWidth: '4px' }, 8: { outlineWidth: '8px' } },
    outlineColor: { transparent: { outlineColor: 'transparent' }, primary: { outlineColor: 'var(--ant-color-primary)' }, current: { outlineColor: 'currentColor' }, white: { outlineColor: '#fff' }, black: { outlineColor: '#000' } },
    outlineOffset: { 0: { outlineOffset: '0' }, 1: { outlineOffset: '1px' }, 2: { outlineOffset: '2px' }, 4: { outlineOffset: '4px' }, 8: { outlineOffset: '8px' } },

    // ==================== shadow / ring ====================
    boxShadow: {
      none: { boxShadow: 'none' },
      sm: { boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      base: { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
      md: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
      lg: { boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
      xl: { boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
      '2xl': { boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
      inner: { boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },
      antd: { boxShadow: 'var(--ant-box-shadow)' },
      'antd-lg': { boxShadow: 'var(--ant-box-shadow-secondary)' },
    },

    // ==================== transition ====================
    transitionProperty: { none: { transitionProperty: 'none' }, all: { transitionProperty: 'all' }, colors: { transitionProperty: 'color, background-color, border-color, fill, stroke' }, opacity: { transitionProperty: 'opacity' }, shadow: { transitionProperty: 'box-shadow' }, transform: { transitionProperty: 'transform' }, width: { transitionProperty: 'width' } },
    transitionDuration: { 0: { transitionDuration: '0s' }, 75: { transitionDuration: '75ms' }, 100: { transitionDuration: '100ms' }, 150: { transitionDuration: '150ms' }, 200: { transitionDuration: '200ms' }, 300: { transitionDuration: '300ms' }, 500: { transitionDuration: '500ms' }, 700: { transitionDuration: '700ms' }, 1000: { transitionDuration: '1000ms' } },
    transitionTimingFunction: { linear: { transitionTimingFunction: 'linear' }, 'in': { transitionTimingFunction: 'cubic-bezier(0.4, 0, 1, 1)' }, out: { transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }, 'in-out': { transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }, ease: { transitionTimingFunction: 'ease' } },
    transitionDelay: { 0: { transitionDelay: '0s' }, 75: { transitionDelay: '75ms' }, 100: { transitionDelay: '100ms' }, 150: { transitionDelay: '150ms' }, 200: { transitionDelay: '200ms' }, 300: { transitionDelay: '300ms' }, 500: { transitionDelay: '500ms' }, 700: { transitionDelay: '700ms' }, 1000: { transitionDelay: '1000ms' } },
    transition: { none: { transition: 'none' }, all: { transition: 'all 0.2s ease' } },
    animation: {
      none: { animation: 'none' },
      spin: { animation: `${spinKf} 1s linear infinite` },
      ping: { animation: `${pingKf} 1s cubic-bezier(0, 0, 0.2, 1) infinite` },
      pulse: { animation: `${pulseKf} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` },
      bounce: { animation: `${bounceKf} 1s infinite` },
    },

    // ==================== transform ====================
    // 注意：vanilla-extract sprinkles 不允许不同 property 共享同一 CSS 属性。
    // transform 不能和 scale/rotate/translate/skew 共存，因此这里不放 transform。
    // 取消 transform 写 `style([sprinkles({ scale: '100', rotate: '0' }), { transform: 'none' }])`
    scale: { 0: { transform: 'scale(0)' }, 50: { transform: 'scale(0.5)' }, 75: { transform: 'scale(0.75)' }, 90: { transform: 'scale(0.9)' }, 95: { transform: 'scale(0.95)' }, 100: { transform: 'scale(1)' }, 105: { transform: 'scale(1.05)' }, 110: { transform: 'scale(1.1)' }, 125: { transform: 'scale(1.25)' }, 150: { transform: 'scale(1.5)' } },
    rotate: { 0: { transform: 'rotate(0deg)' }, 1: { transform: 'rotate(1deg)' }, 3: { transform: 'rotate(3deg)' }, 6: { transform: 'rotate(6deg)' }, 12: { transform: 'rotate(12deg)' }, 45: { transform: 'rotate(45deg)' }, 90: { transform: 'rotate(90deg)' }, 180: { transform: 'rotate(180deg)' }, '-45': { transform: 'rotate(-45deg)' }, '-90': { transform: 'rotate(-90deg)' }, '-180': { transform: 'rotate(-180deg)' } },
    translateX: { 0: { transform: 'translateX(0px)' }, 1: { transform: 'translateX(4px)' }, 2: { transform: 'translateX(8px)' }, 4: { transform: 'translateX(16px)' }, '-1': { transform: 'translateX(-4px)' }, '-2': { transform: 'translateX(-8px)' }, '-4': { transform: 'translateX(-16px)' }, '1/2': { transform: 'translateX(50%)' }, full: { transform: 'translateX(100%)' }, '-1/2': { transform: 'translateX(-50%)' }, '-full': { transform: 'translateX(-100%)' } },
    translateY: { 0: { transform: 'translateY(0px)' }, 1: { transform: 'translateY(4px)' }, 2: { transform: 'translateY(8px)' }, 4: { transform: 'translateY(16px)' }, '-1': { transform: 'translateY(-4px)' }, '-2': { transform: 'translateY(-8px)' }, '-4': { transform: 'translateY(-16px)' }, '1/2': { transform: 'translateY(50%)' }, full: { transform: 'translateY(100%)' }, '-1/2': { transform: 'translateY(-50%)' }, '-full': { transform: 'translateY(-100%)' } },
    skewX: { 0: { transform: 'skewX(0deg)' }, 1: { transform: 'skewX(1deg)' }, 3: { transform: 'skewX(3deg)' }, 6: { transform: 'skewX(6deg)' }, 12: { transform: 'skewX(12deg)' }, '-1': { transform: 'skewX(-1deg)' }, '-3': { transform: 'skewX(-3deg)' }, '-6': { transform: 'skewX(-6deg)' }, '-12': { transform: 'skewX(-12deg)' } },
    skewY: { 0: { transform: 'skewY(0deg)' }, 1: { transform: 'skewY(1deg)' }, 3: { transform: 'skewY(3deg)' }, 6: { transform: 'skewY(6deg)' }, 12: { transform: 'skewY(12deg)' }, '-1': { transform: 'skewY(-1deg)' }, '-3': { transform: 'skewY(-3deg)' }, '-6': { transform: 'skewY(-6deg)' }, '-12': { transform: 'skewY(-12deg)' } },
    transformOrigin: { center: { transformOrigin: 'center' }, top: { transformOrigin: 'top' }, 'top-right': { transformOrigin: 'top right' }, right: { transformOrigin: 'right' }, 'bottom-right': { transformOrigin: 'bottom right' }, bottom: { transformOrigin: 'bottom' }, 'bottom-left': { transformOrigin: 'bottom left' }, left: { transformOrigin: 'left' }, 'top-left': { transformOrigin: 'top left' } },

    // ==================== filter ====================
    // 同 transform，filter 不与 blur/brightness/... 共存。
    // 关闭滤镜：`style([sprinkles({ blur: '0', grayscale: '0' }), { filter: 'none' }])`
    blur: { 0: { filter: 'blur(0)' }, sm: { filter: 'blur(2px)' }, base: { filter: 'blur(4px)' }, md: { filter: 'blur(8px)' }, lg: { filter: 'blur(12px)' }, xl: { filter: 'blur(16px)' }, '2xl': { filter: 'blur(24px)' }, '3xl': { filter: 'blur(40px)' } },
    brightness: { 0: { filter: 'brightness(0)' }, 50: { filter: 'brightness(0.5)' }, 75: { filter: 'brightness(0.75)' }, 90: { filter: 'brightness(0.9)' }, 95: { filter: 'brightness(0.95)' }, 100: { filter: 'brightness(1)' }, 105: { filter: 'brightness(1.05)' }, 110: { filter: 'brightness(1.1)' }, 125: { filter: 'brightness(1.25)' }, 150: { filter: 'brightness(1.5)' }, 200: { filter: 'brightness(2)' } },
    contrast: { 0: { filter: 'contrast(0)' }, 50: { filter: 'contrast(0.5)' }, 75: { filter: 'contrast(0.75)' }, 100: { filter: 'contrast(1)' }, 125: { filter: 'contrast(1.25)' }, 150: { filter: 'contrast(1.5)' }, 200: { filter: 'contrast(2)' } },
    saturate: { 0: { filter: 'saturate(0)' }, 50: { filter: 'saturate(0.5)' }, 100: { filter: 'saturate(1)' }, 150: { filter: 'saturate(1.5)' }, 200: { filter: 'saturate(2)' } },
    grayscale: { 0: { filter: 'grayscale(0)' }, true: { filter: 'grayscale(100%)' } },
    hueRotate: { 0: { filter: 'hue-rotate(0deg)' }, 15: { filter: 'hue-rotate(15deg)' }, 30: { filter: 'hue-rotate(30deg)' }, 60: { filter: 'hue-rotate(60deg)' }, 90: { filter: 'hue-rotate(90deg)' }, 180: { filter: 'hue-rotate(180deg)' } },
    invert: { 0: { filter: 'invert(0)' }, true: { filter: 'invert(100%)' } },
    sepia: { 0: { filter: 'sepia(0)' }, true: { filter: 'sepia(100%)' } },
    backdropBlur: { 0: { backdropFilter: 'blur(0)' }, sm: { backdropFilter: 'blur(2px)' }, base: { backdropFilter: 'blur(4px)' }, md: { backdropFilter: 'blur(8px)' }, lg: { backdropFilter: 'blur(12px)' }, xl: { backdropFilter: 'blur(16px)' }, '2xl': { backdropFilter: 'blur(24px)' }, '3xl': { backdropFilter: 'blur(40px)' } },
    backdropBrightness: { 0: { backdropFilter: 'brightness(0)' }, 50: { backdropFilter: 'brightness(0.5)' }, 100: { backdropFilter: 'brightness(1)' }, 150: { backdropFilter: 'brightness(1.5)' }, 200: { backdropFilter: 'brightness(2)' } },
    backdropSaturate: { 0: { backdropFilter: 'saturate(0)' }, 50: { backdropFilter: 'saturate(0.5)' }, 100: { backdropFilter: 'saturate(1)' }, 150: { backdropFilter: 'saturate(1.5)' }, 200: { backdropFilter: 'saturate(2)' } },
    backdropGrayscale: { 0: { backdropFilter: 'grayscale(0)' }, true: { backdropFilter: 'grayscale(100%)' } },

    // ==================== overflow ====================
    overflow: { auto: { overflow: 'auto' }, hidden: { overflow: 'hidden' }, clip: { overflow: 'clip' }, visible: { overflow: 'visible' }, scroll: { overflow: 'scroll' } },
    overflowX: { auto: { overflowX: 'auto' }, hidden: { overflowX: 'hidden' }, clip: { overflowX: 'clip' }, visible: { overflowX: 'visible' }, scroll: { overflowX: 'scroll' } },
    overflowY: { auto: { overflowY: 'auto' }, hidden: { overflowY: 'hidden' }, clip: { overflowY: 'clip' }, visible: { overflowY: 'visible' }, scroll: { overflowY: 'scroll' } },

    // ==================== position ====================
    position: { static: { position: 'static' }, relative: { position: 'relative' }, absolute: { position: 'absolute' }, sticky: { position: 'sticky' }, fixed: { position: 'fixed' } },
    inset: { 0: { inset: '0' }, '0_5': { inset: '2px' }, 1: { inset: '4px' }, 2: { inset: '8px' }, 3: { inset: '12px' }, 4: { inset: '16px' }, 6: { inset: '24px' }, 8: { inset: '32px' }, auto: { inset: 'auto' }, full: { inset: '100%' }, '-1': { inset: '-4px' }, '-2': { inset: '-8px' }, '-4': { inset: '-16px' }, x: { left: '0', right: '0' }, y: { top: '0', bottom: '0' } },
    top: { 0: { top: '0' }, 1: { top: '4px' }, 2: { top: '8px' }, 3: { top: '12px' }, 4: { top: '16px' }, 6: { top: '24px' }, 8: { top: '32px' }, 12: { top: '48px' }, auto: { top: 'auto' }, full: { top: '100%' }, '-1': { top: '-4px' }, '-2': { top: '-8px' }, '-4': { top: '-16px' } },
    right: { 0: { right: '0' }, 1: { right: '4px' }, 2: { right: '8px' }, 3: { right: '12px' }, 4: { right: '16px' }, 6: { right: '24px' }, 8: { right: '32px' }, auto: { right: 'auto' }, full: { right: '100%' }, '-1': { right: '-4px' }, '-2': { right: '-8px' }, '-4': { right: '-16px' } },
    bottom: { 0: { bottom: '0' }, 1: { bottom: '4px' }, 2: { bottom: '8px' }, 3: { bottom: '12px' }, 4: { bottom: '16px' }, 6: { bottom: '24px' }, 8: { bottom: '32px' }, auto: { bottom: 'auto' }, full: { bottom: '100%' }, '-1': { bottom: '-4px' }, '-2': { bottom: '-8px' }, '-4': { bottom: '-16px' } },
    left: { 0: { left: '0' }, 1: { left: '4px' }, 2: { left: '8px' }, 3: { left: '12px' }, 4: { left: '16px' }, 6: { left: '24px' }, 8: { left: '32px' }, auto: { left: 'auto' }, full: { left: '100%' }, '-1': { left: '-4px' }, '-2': { left: '-8px' }, '-4': { left: '-16px' } },
    insetInline: { 0: { left: '0', right: '0' }, auto: { left: 'auto', right: 'auto' } },
    insetBlock: { 0: { top: '0', bottom: '0' }, auto: { top: 'auto', bottom: 'auto' } },
    zIndex: { 0: { zIndex: '0' }, 10: { zIndex: '10' }, 20: { zIndex: '20' }, 30: { zIndex: '30' }, 40: { zIndex: '40' }, 50: { zIndex: '50' }, 60: { zIndex: '60' }, 70: { zIndex: '70' }, 80: { zIndex: '80' }, 90: { zIndex: '90' }, 100: { zIndex: '100' }, auto: { zIndex: 'auto' } },

    // ==================== interactivity ====================
    cursor: { auto: { cursor: 'auto' }, default: { cursor: 'default' }, pointer: { cursor: 'pointer' }, wait: { cursor: 'wait' }, text: { cursor: 'text' }, move: { cursor: 'move' }, not: { cursor: 'not-allowed' }, crosshair: { cursor: 'crosshair' }, grab: { cursor: 'grab' }, grabbing: { cursor: 'grabbing' } },
    pointerEvents: { none: { pointerEvents: 'none' }, auto: { pointerEvents: 'auto' } },
    userSelect: { none: { userSelect: 'none' }, text: { userSelect: 'text' }, all: { userSelect: 'all' }, auto: { userSelect: 'auto' } },
    resize: { none: { resize: 'none' }, x: { resize: 'horizontal' }, y: { resize: 'vertical' }, both: { resize: 'both' } },
    appearance: { none: { appearance: 'none' }, auto: { appearance: 'auto' } },
    accentColor: { auto: { accentColor: 'auto' }, primary: { accentColor: 'var(--ant-color-primary)' }, transparent: { accentColor: 'transparent' }, current: { accentColor: 'currentColor' } },
    caretColor: { auto: { caretColor: 'auto' }, primary: { caretColor: 'var(--ant-color-primary)' }, transparent: { caretColor: 'transparent' }, current: { caretColor: 'currentColor' } },
    scrollBehavior: { auto: { scrollBehavior: 'auto' }, smooth: { scrollBehavior: 'smooth' } },
    scrollSnapType: { none: { scrollSnapType: 'none' }, x: { scrollSnapType: 'x mandatory' }, y: { scrollSnapType: 'y mandatory' } },
    scrollSnapAlign: { start: { scrollSnapAlign: 'start' }, end: { scrollSnapAlign: 'end' }, center: { scrollSnapAlign: 'center' }, none: { scrollSnapAlign: 'none' } },
    touchAction: { auto: { touchAction: 'auto' }, none: { touchAction: 'none' }, manipulation: { touchAction: 'manipulation' }, 'pan-x': { touchAction: 'pan-x' }, 'pan-y': { touchAction: 'pan-y' }, 'pinch-zoom': { touchAction: 'pinch-zoom' } },

    // ==================== replaced / object ====================
    objectFit: { contain: { objectFit: 'contain' }, cover: { objectFit: 'cover' }, fill: { objectFit: 'fill' }, none: { objectFit: 'none' }, 'scale-down': { objectFit: 'scale-down' } },
    objectPosition: { bottom: { objectPosition: 'bottom' }, center: { objectPosition: 'center' }, left: { objectPosition: 'left' }, 'left-bottom': { objectPosition: 'left bottom' }, 'left-top': { objectPosition: 'left top' }, right: { objectPosition: 'right' }, 'right-bottom': { objectPosition: 'right bottom' }, 'right-top': { objectPosition: 'right top' }, top: { objectPosition: 'top' } },
  },
  shorthands: {
    // spacing
    px: ['paddingLeft', 'paddingRight'],
    py: ['paddingTop', 'paddingBottom'],
    p: ['padding'],
    mx: ['marginLeft', 'marginRight'],
    my: ['marginTop', 'marginBottom'],
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
    // sizing
    w: ['width'],
    h: ['height'],
    size: ['width', 'height'],
    minW: ['minWidth'],
    minH: ['minHeight'],
    maxW: ['maxWidth'],
    maxH: ['maxHeight'],
    // layout
    rounded: ['borderRadius'],
    roundedT: ['borderTopLeftRadius', 'borderTopRightRadius'],
    roundedB: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
    roundedL: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
    roundedR: ['borderTopRightRadius', 'borderBottomRightRadius'],
    items: ['alignItems'],
    justify: ['justifyContent'],
    flexCol: ['flexDirection'],
    flexRow: ['flexDirection'],
    gridCols: ['gridTemplateColumns'],
    gridRows: ['gridTemplateRows'],
    colSpan: ['gridColumn'],
    rowSpan: ['gridRow'],
    // overflow
    truncate: ['overflow', 'textOverflow', 'whiteSpace'],
    // color (semantic aliases used in views/components)
    textPrimary: ['color'],
    textText: ['color'],
    textTextSecondary: ['color'],
    textTextTertiary: ['color'],
    textTextQuaternary: ['color'],
    textSuccess: ['color'],
    textWarning: ['color'],
    textError: ['color'],
    textWhite: ['color'],
    textBlack: ['color'],
    textRedFF4D4F: ['color'],
    textGreen52C41A: ['color'],
    textBlue1677FF: ['color'],
    bgLayout: ['backgroundColor'],
    bgContainer: ['backgroundColor'],
    bgElevated: ['backgroundColor'],
    bgPrimary: ['backgroundColor'],
    bgPrimaryBg: ['backgroundColor'],
    bgPrimaryHover: ['backgroundColor'],
    bgPrimaryActive: ['backgroundColor'],
    bgFillSecondary: ['backgroundColor'],
    bgFillTertiary: ['backgroundColor'],
    bgFillQuaternary: ['backgroundColor'],
    bgTransparent: ['backgroundColor'],
    bgGreenLight: ['backgroundColor'],
    bgYellowLight: ['backgroundColor'],
    bgRedLight: ['backgroundColor'],
    bgPrimary85: ['backgroundColor'],
    bgBlack: ['backgroundColor'],
    bgWhite: ['backgroundColor'],
    // border
    borderB: ['borderBottom'],
    borderT: ['borderTop'],
    borderR: ['borderRight'],
    borderL: ['borderLeft'],
    // font
    textXs: ['fontSize'],
    textSm: ['fontSize'],
    textBase: ['fontSize'],
    textLg: ['fontSize'],
    textXl: ['fontSize'],
    text2xl: ['fontSize'],
    text3xl: ['fontSize'],
    textLeft: ['textAlign'],
    textCenter: ['textAlign'],
    textRight: ['textAlign'],
    fontBold: ['fontWeight'],
    fontSemibold: ['fontWeight'],
    fontMedium: ['fontWeight'],
    fontNormal: ['fontWeight'],
    fontMono: ['fontFamily'],
    leadingNone: ['lineHeight'],
    leadingTight: ['lineHeight'],
    leadingNormal: ['lineHeight'],
    trackingWidest: ['letterSpacing'],
    tabularNums: ['fontVariantNumeric'],
    // transition
    duration: ['transitionDuration'],
    delay: ['transitionDelay'],
    ease: ['transitionTimingFunction'],
    // transform / filter / shadow
    shadowAntd: ['boxShadow'],
    shadowAntdLg: ['boxShadow'],
    overflowHidden: ['overflow'],
    overflowYAuto: ['overflowY'],
    overflowXAuto: ['overflowX'],
    cursorPointer: ['cursor'],
    // position
    insetX: ['left', 'right'],
    insetY: ['top', 'bottom'],
  },
})

/**
 * 动画 keyframes —— 见文件顶部 spinKf / pingKf / pulseKf / bounceKf 定义
 */

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

// ============================================================
// 9. 高阶复合 recipe —— 通用 UI 模式
// ------------------------------------------------------------
// 这些是「把多个 atomic class 拼起来表达一个 UI 概念」的高阶封装。
// 内部全部基于 compose(sprinkles(...), localStyle) 组合而成。
// 支持：size / tone / state / orientation 多 variant + 响应式变体。
// ============================================================

/**
 * `overlay` —— 浮层容器
 *
 * 用法：弹窗、抽屉、Popover、Tooltip 等需要覆盖在其他内容上方的容器。
 * variants:
 *   • tone: light / dark / primary —— 背景色主题
 *   • elevation: sm / md / lg —— 阴影层级
 *   • size: sm / md / lg / full —— 宽度（full = 100%）
 *   • padding: none / sm / md / lg —— 内边距
 */
export const overlay = recipe({
  base: {
    position: 'absolute',
    borderRadius: 'var(--ant-border-radius-lg)',
    zIndex: 50,
  },
  variants: {
    tone: {
      light: {
        backgroundColor: 'var(--ant-color-bg-elevated)',
        color: 'var(--ant-color-text)',
      },
      dark: {
        backgroundColor: 'var(--ant-color-text)',
        color: '#fff',
      },
      primary: {
        backgroundColor: 'var(--ant-color-primary)',
        color: '#fff',
      },
    },
    elevation: {
      sm: { boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      md: { boxShadow: 'var(--ant-box-shadow-secondary)' },
      lg: { boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
    },
    size: {
      sm: { width: '320px' },
      md: { width: '480px' },
      lg: { width: '640px' },
      full: { width: '100%' },
    },
    padding: {
      none: { padding: '0' },
      sm: { padding: 'calc(var(--space-unit) * 2)' },
      md: { padding: 'calc(var(--space-unit) * 4)' },
      lg: { padding: 'calc(var(--space-unit) * 6)' },
    },
  },
  defaultVariants: {
    tone: 'light',
    elevation: 'md',
    size: 'md',
    padding: 'md',
  },
})
export type OverlayVariants = RecipeVariants<typeof overlay>

/**
 * `actionBar` —— 操作栏（页面右侧按钮组）
 *
 * 用法：表单底部的【取消 / 提交】、详情页顶部的【编辑 / 删除】。
 * variants:
 *   • direction: row / row-reverse / col —— 排列方向
 *   • justify: start / center / end / between —— 主轴对齐
 *   • gap: sm / md / lg —— 间距
 *   • responsive: 移动端自动切换为 col 排列
 */
export const actionBar = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    '@media': {
      'screen and (min-width: 640px)': {
        flexDirection: 'row',
      },
    },
  },
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      'row-reverse': { flexDirection: 'row-reverse' },
      col: { flexDirection: 'column' },
      'col-reverse': { flexDirection: 'column-reverse' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
    },
    gap: {
      sm: { gap: 'calc(var(--space-unit) * 2)' },
      md: { gap: 'calc(var(--space-unit) * 4)' },
      lg: { gap: 'calc(var(--space-unit) * 6)' },
    },
  },
  defaultVariants: {
    direction: 'row',
    justify: 'end',
    gap: 'md',
  },
})
export type ActionBarVariants = RecipeVariants<typeof actionBar>

/**
 * `inputGroup` —— 表单输入组合
 *
 * 用法：label + input + help / error 的垂直堆叠容器。
 * variants:
 *   • size: sm / md / lg —— 控制 input 高度（用 inline label / help 字号体现）
 *   • required: true 时 label 后加红色星号占位（实际由业务层渲染）
 *   • invalid: true 时 help 文字变红
 */
export const inputGroup = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--space-unit) * 1)',
    width: '100%',
  },
  variants: {
    size: {
      sm: { fontSize: '12px' },
      md: { fontSize: '14px' },
      lg: { fontSize: '16px' },
    },
    required: {
      true: {},
    },
    invalid: {
      true: {
        color: 'var(--ant-color-error)',
      },
    },
    fullWidth: {
      true: { width: '100%' },
      false: { width: 'auto' },
    },
  },
  defaultVariants: { size: 'md', fullWidth: true },
})
export type InputGroupVariants = RecipeVariants<typeof inputGroup>

/**
 * `stackCard` —— 卡片堆叠容器（仪表盘 / 列表）
 *
 * 用法：竖向堆叠的多个 card item，gap / padding / size variants。
 */
export const stackCard = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--space-unit) * 4)',
  },
  variants: {
    gap: {
      sm: { gap: 'calc(var(--space-unit) * 2)' },
      md: { gap: 'calc(var(--space-unit) * 4)' },
      lg: { gap: 'calc(var(--space-unit) * 6)' },
    },
    tone: {
      container: { backgroundColor: 'var(--ant-color-bg-container)', padding: 'calc(var(--space-unit) * 5)', borderRadius: 'var(--ant-border-radius-lg)' },
      transparent: { backgroundColor: 'transparent' },
      layout: { backgroundColor: 'var(--ant-color-bg-layout)', padding: 'calc(var(--space-unit) * 5)', borderRadius: 'var(--ant-border-radius-lg)' },
    },
  },
  defaultVariants: { gap: 'md', tone: 'transparent' },
})
export type StackCardVariants = RecipeVariants<typeof stackCard>

/**
 * `centerBox` —— 完美居中容器（flex + center）
 *
 * 用法：登录页、404、空状态等需要把单个元素完美居中的场景。
 */
export const centerBox = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      col: { flexDirection: 'column' },
    },
    gap: {
      sm: { gap: 'calc(var(--space-unit) * 2)' },
      md: { gap: 'calc(var(--space-unit) * 4)' },
      lg: { gap: 'calc(var(--space-unit) * 6)' },
    },
    bg: {
      layout: { backgroundColor: 'var(--ant-color-bg-layout)' },
      container: { backgroundColor: 'var(--ant-color-bg-container)' },
      transparent: { backgroundColor: 'transparent' },
    },
  },
  defaultVariants: { direction: 'col', gap: 'md', bg: 'layout' },
})
export type CenterBoxVariants = RecipeVariants<typeof centerBox>

/**
 * `toolbarRow` —— 顶部工具栏（搜索 + 按钮）
 *
 * 用法：表格上方的搜索框 + 操作按钮容器。响应式：移动端 col，桌面 row。
 */
export const toolbarRow = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--space-unit) * 3)',
    '@media': {
      'screen and (min-width: 640px)': {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
  },
  variants: {
    gap: {
      sm: { gap: 'calc(var(--space-unit) * 2)' },
      md: { gap: 'calc(var(--space-unit) * 3)' },
      lg: { gap: 'calc(var(--space-unit) * 4)' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
    },
    padded: {
      true: { padding: 'calc(var(--space-unit) * 3) calc(var(--space-unit) * 5)' },
      false: { padding: '0' },
    },
  },
  defaultVariants: { gap: 'md', align: 'center', padded: true },
})
export type ToolbarRowVariants = RecipeVariants<typeof toolbarRow>

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

// ============================================================
// 10. 动态 utility —— 运行时注入 CSS 变量
// ------------------------------------------------------------
// UnoCSS 卖点之一：`bg-[#abc]` 这种带方括号的「任意值」会被构建器即时编译。
// vanilla-extract 没有构建器，但可以通过 CSS 变量实现类似能力：
//
//   1. `dynamicVars` —— 一组命名 CSS 变量（如 --utility-color / --utility-bg）
//   2. `dynamicVarNames` —— 同名对象，存放 .toString() 后的真实 CSS 变量名
//   3. `applyDynamic(vars)` —— 在 TSX 里通过 inline style 覆盖
//
// 用法：
//   import { dynColorPrimary } from '@/styles/utility.css'
//   import { applyDynamic } from '@/styles/compose'
//
//   const tone = applyDynamic({ color: '#ff4d4f' })
//   <div style={tone} class={dynColorPrimary} />
// ============================================================

/** 暴露给业务代码的动态 token —— 命名空间在 :root 注入，初始值由 calc() 派生 */
export const dynamicVars = {
  color: createVar(),         // 用户主色（业务可覆盖）
  bg: createVar(),            // 用户背景（业务可覆盖）
  ringColor: createVar(),     // ring 主色
  ringWidth: createVar(),     // ring 宽度（px）
  ringOpacity: createVar(),   // ring 透明度 0-1
  borderColor: createVar(),  // 用户边框色
  textColor: createVar(),    // 用户文字色
  gradientFrom: createVar(), // 渐变起始色
  gradientVia: createVar(),   // 渐变中点色
  gradientTo: createVar(),   // 渐变结束色
} as const

/** 与 dynamicVars 一一对应的 CSS 变量名（供 applyDynamic 跨文件使用） */
export const dynamicVarNames = {
  color: dynamicVars.color.toString(),
  bg: dynamicVars.bg.toString(),
  ringColor: dynamicVars.ringColor.toString(),
  ringWidth: dynamicVars.ringWidth.toString(),
  ringOpacity: dynamicVars.ringOpacity.toString(),
  borderColor: dynamicVars.borderColor.toString(),
  textColor: dynamicVars.textColor.toString(),
  gradientFrom: dynamicVars.gradientFrom.toString(),
  gradientVia: dynamicVars.gradientVia.toString(),
  gradientTo: dynamicVars.gradientTo.toString(),
} as const

// 在 :root 提供初始值（globalStyle 接受 { vars: { [varName]: value } }）
globalStyle(
  ':root',
  {
    vars: assignVars(dynamicVars, {
      color: '#1677ff',
      bg: '#ffffff',
      ringColor: '#3b82f6',
      ringWidth: '3px',
      ringOpacity: '0.5',
      borderColor: '#d9d9d9',
      textColor: 'rgba(0, 0, 0, 0.88)',
      gradientFrom: '#1677ff',
      gradientVia: '#69b1ff',
      gradientTo: '#bae0ff',
    }),
  },
)

// dark 模式下 token 也跟随切换
globalStyle(
  'html.dark',
  {
    vars: assignVars(dynamicVars, {
      color: '#177ddc',
      bg: '#141414',
      ringColor: '#177ddc',
      ringWidth: '3px',
      ringOpacity: '0.5',
      borderColor: '#424242',
      textColor: 'rgba(255, 255, 255, 0.85)',
      gradientFrom: '#177ddc',
      gradientVia: '#3c9ae8',
      gradientTo: '#5db1f3',
    }),
  },
)

/**
 * 业务组件动态注入 token 的 API 已在 @/styles/compose.ts 暴露（applyDynamic）。
 *
 * 在这里仅做 CSS 变量定义 + style() 输出的过渡 class。
 */

/** 引用 dynamicVars 的预设 utility class —— 给「主色用变量」的场景用 */
export const dynColorPrimary = style({ color: dynamicVars.color })
export const dynBgPrimary = style({ backgroundColor: dynamicVars.bg })
export const dynBorderPrimary = style({ borderColor: dynamicVars.borderColor })
export const dynTextPrimary = style({ color: dynamicVars.textColor })
export const dynGradientFromTo = style({
  backgroundImage: `linear-gradient(to right, ${dynamicVars.gradientFrom}, ${dynamicVars.gradientTo})`,
})

// ============================================================
// 11. Tailwind v4 缺失能力补齐 —— 完整覆盖 core utilities
// ------------------------------------------------------------

// ----- gradient -----
export const bgGradientToT = style({ backgroundImage: 'linear-gradient(to top, var(--ant-color-fill-tertiary), transparent)' })
export const bgGradientToTr = style({ 
  backgroundImage: 'linear-gradient(to top right, var(--ant-color-primary-bg), var(--ant-color-bg-container))' 
})
export const bgGradientToR = style({ 
  backgroundImage: 'linear-gradient(to right, var(--ant-color-primary-bg), transparent)' 
})
export const bgGradientToB = style({ 
  backgroundImage: 'linear-gradient(to bottom, var(--ant-color-primary), var(--ant-color-primary-active))' 
})
export const bgGradientToBr = style({ 
  backgroundImage: 'linear-gradient(to bottom right, var(--ant-color-primary), var(--ant-color-primary-active))' 
})
export const bgGradientToBl = style({ 
  backgroundImage: 'linear-gradient(to bottom left, var(--ant-color-primary), var(--ant-color-primary-active))' 
})

/** 文字渐变 —— 给标题用 */
export const textGradientPrimary = style({
  backgroundImage: 'linear-gradient(to right, var(--ant-color-primary), var(--ant-color-primary-active))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
})

// ----- mask（用 maskImage 驼峰属性） -----
export const maskCircle = style({ maskImage: 'radial-gradient(circle, black 100%, transparent 100%)' })
export const maskSquare = style({ maskImage: 'linear-gradient(black, black)' })
export const maskNone = style({ maskImage: 'none' })

// ----- ring（增强版，复用 boxShadow 但接受 color vars） -----
export const ringNone = style({ boxShadow: 'none' })
export const ring1 = style({ boxShadow: `0 0 0 calc(${dynamicVars.ringWidth} * 0.33) ${dynamicVars.ringColor}` })
export const ring2 = style({ boxShadow: `0 0 0 calc(${dynamicVars.ringWidth} * 0.66) ${dynamicVars.ringColor}` })
export const ring4 = style({ boxShadow: `0 0 0 ${dynamicVars.ringWidth} ${dynamicVars.ringColor}` })
export const ring8 = style({ boxShadow: `0 0 0 calc(${dynamicVars.ringWidth} * 2) ${dynamicVars.ringColor}` })
export const ringInner = style({ boxShadow: `inset 0 0 0 ${dynamicVars.ringWidth} ${dynamicVars.ringColor}` })

// ----- isolation / mix-blend / blend mode -----
export const isolate = style({ isolation: 'isolate' })
export const isolationAuto = style({ isolation: 'auto' })
export const blendNormal = style({ mixBlendMode: 'normal' })
export const blendMultiply = style({ mixBlendMode: 'multiply' })
export const blendScreen = style({ mixBlendMode: 'screen' })
export const blendOverlay = style({ mixBlendMode: 'overlay' })
export const blendDarken = style({ mixBlendMode: 'darken' })
export const blendLighten = style({ mixBlendMode: 'lighten' })
export const blendColorDodge = style({ mixBlendMode: 'color-dodge' })
export const blendColorBurn = style({ mixBlendMode: 'color-burn' })
export const blendHardLight = style({ mixBlendMode: 'hard-light' })
export const blendSoftLight = style({ mixBlendMode: 'soft-light' })
export const blendDifference = style({ mixBlendMode: 'difference' })
export const blendExclusion = style({ mixBlendMode: 'exclusion' })
export const blendHue = style({ mixBlendMode: 'hue' })
export const blendSaturation = style({ mixBlendMode: 'saturation' })
export const blendColor = style({ mixBlendMode: 'color' })
export const blendLuminosity = style({ mixBlendMode: 'luminosity' })

// ----- will-change / contain -----
export const willChangeAuto = style({ willChange: 'auto' })
export const willChangeScroll = style({ willChange: 'scroll-position' })
export const willChangeContents = style({ willChange: 'contents' })
export const willChangeTransform = style({ willChange: 'transform' })

export const containNone = style({ contain: 'none' })
export const containStrict = style({ contain: 'strict' })
export const containContent = style({ contain: 'content' })
export const containLayout = style({ contain: 'layout' })
export const containStyle = style({ contain: 'style' })
export const containPaint = style({ contain: 'paint' })
export const containSize = style({ contain: 'size' })

// ----- columns (multi-column 布局) -----
export const columns1 = style({ columns: '1' })
export const columns2 = style({ columns: '2' })
export const columns3 = style({ columns: '3' })
export const columns4 = style({ columns: '4' })
export const columns5 = style({ columns: '5' })
export const columnsAuto = style({ columns: 'auto' })
export const columns3xs = style({ columnWidth: '16rem' })
export const columns2xs = style({ columnWidth: '18rem' })
export const columnsXs = style({ columnWidth: '20rem' })
export const columnsSm = style({ columnWidth: '24rem' })
export const columnsMd = style({ columnWidth: '28rem' })
export const columnsLg = style({ columnWidth: '32rem' })
export const columnsXl = style({ columnWidth: '36rem' })
export const columns2xl = style({ columnWidth: '42rem' })
export const columns3xl = style({ columnWidth: '48rem' })
export const columns4xl = style({ columnWidth: '56rem' })
export const columns5xl = style({ columnWidth: '64rem' })
export const columns6xl = style({ columnWidth: '72rem' })
export const columns7xl = style({ columnWidth: '80rem' })

// ----- scroll-margin / scroll-padding -----
export const scrollM0 = style({ scrollMargin: 0 })
export const scrollM2 = style({ scrollMargin: '8px' })
export const scrollM4 = style({ scrollMargin: '16px' })
export const scrollM8 = style({ scrollMargin: '32px' })
export const scrollP0 = style({ scrollPadding: 0 })
export const scrollP2 = style({ scrollPadding: '8px' })
export const scrollP4 = style({ scrollPadding: '16px' })
export const scrollP8 = style({ scrollPadding: '32px' })

export const scrollSnapNormal = style({ scrollSnapStop: 'normal' })
export const scrollSnapAlways = style({ scrollSnapStop: 'always' })

// ----- hyphens / writing-mode / orientation -----
export const hyphensNone = style({ hyphens: 'none' })
export const hyphensManual = style({ hyphens: 'manual' })
export const hyphensAuto = style({ hyphens: 'auto' })

export const writingModeHorizontal = style({ writingMode: 'horizontal-tb' })
export const writingModeVertical = style({ writingMode: 'vertical-rl' })

// ----- field-sizing / form / 表单增强 -----
export const fieldSizingFixed = style({ fieldSizing: 'fixed' })
export const fieldSizingContent = style({ fieldSizing: 'content' })

// ----- content / placeholder / empty 内容 -----
export const contentEmpty = style({ content: '""' })
export const contentNone = style({ content: 'none' })

// ----- hyphens / line-clamp 增强 -----
export const lineClamp1 = style({ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 })
export const lineClamp2 = style({ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 })
export const lineClamp3 = style({ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3 })
export const lineClamp4 = style({ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4 })
export const lineClamp5 = style({ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 5 })
export const lineClamp6 = style({ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 6 })
export const lineClampNone = style({ display: 'block', overflow: 'visible', WebkitBoxOrient: 'horizontal', WebkitLineClamp: 'none' })

// ----- 列表样式 -----
export const listNone = style({ listStyleType: 'none' })
export const listDisc = style({ listStyleType: 'disc' })
export const listDecimal = style({ listStyleType: 'decimal' })
export const listInside = style({ listStylePosition: 'inside' })
export const listOutside = style({ listStylePosition: 'outside' })

// ----- table -----
export const tableAuto = style({ tableLayout: 'auto' })
export const tableFixed = style({ tableLayout: 'fixed' })
export const borderCollapse = style({ borderCollapse: 'collapse' })
export const borderSeparate = style({ borderCollapse: 'separate' })

// ----- 全屏 / 占满（minHScreen 已在 line 516 兼容垫片里） -----
export const minWScreen = style({ minWidth: '100vw' })
export const hScreen = style({ height: '100vh' })
export const wScreen = style({ width: '100vw' })

// ----- 装饰 -----
export const decorationNone = style({ textDecoration: 'none' })
export const decorationUnderline = style({ textDecorationLine: 'underline' })
export const decorationOverline = style({ textDecorationLine: 'overline' })
export const decorationLineThrough = style({ textDecorationLine: 'line-through' })
export const decorationSolid = style({ textDecorationStyle: 'solid' })
export const decorationDouble = style({ textDecorationStyle: 'double' })
export const decorationDotted = style({ textDecorationStyle: 'dotted' })
export const decorationDashed = style({ textDecorationStyle: 'dashed' })
export const decorationWavy = style({ textDecorationStyle: 'wavy' })
export const underlineOffsetAuto = style({ textUnderlineOffset: 'auto' })
export const underlineOffset0 = style({ textUnderlineOffset: '0' })
export const underlineOffset2 = style({ textUnderlineOffset: '2px' })
export const underlineOffset4 = style({ textUnderlineOffset: '4px' })
export const underlineOffset8 = style({ textUnderlineOffset: '8px' })

// ----- 浮层 / 模态框相关 -----
export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 40,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
})
export const modalContainer = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'calc(var(--space-unit) * 4)',
})

// ----- 可访问性 / 隐藏但保持可读 -----
export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
})
export const notSrOnly = style({
  position: 'static',
  width: 'auto',
  height: 'auto',
  padding: 0,
  margin: 0,
  overflow: 'visible',
  clip: 'auto',
  whiteSpace: 'normal',
})

// ============================================================
// 12. 条件变体（hover / focus / active / disabled / dark / placeholder）
// ------------------------------------------------------------
// sprinkles 的 conditions 类型只接受 @media / @container / @supports，
// 不支持 `:hover` / `.dark &`。所以把"非响应式伪类"统一通过 createTheme
// + globalStyle 暴露成可复用的 class 组合。
// ============================================================

/**
 * 通用 hover 变色：用在卡片 / 链接 / 按钮上
 * 业务代码：`<a class={hoverUnderline}>` 或 `<button class={hoverPrimary}>`
 */
export const hoverUnderline = style({ ':hover': { textDecoration: 'underline' } })
export const hoverPrimary = style({ ':hover': { color: 'var(--ant-color-primary)' } })
export const hoverOpacity80 = style({ ':hover': { opacity: 0.8 } })
export const hoverScale105 = style({
  ':hover': { transform: 'scale(1.05)' },
  transition: 'transform 0.2s ease',
})
export const hoverBgFillTertiary = style({ ':hover': { backgroundColor: 'var(--ant-color-fill-tertiary)' } })

/** focus 状态：键盘可访问 */
export const focusOutlineNone = style({
  ':focus': { outline: 'none' },
  ':focus-visible': { outline: '2px solid var(--ant-color-primary)', outlineOffset: '2px' },
})
export const focusRing = style({
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px var(--ant-color-bg-container), 0 0 0 4px ${dynamicVars.ringColor}`,
  },
})

/** active 状态：按下时 */
export const activeScale95 = style({ ':active': { transform: 'scale(0.95)' } })

/** disabled 状态：禁用时 */
export const disabledOpacity50 = style({
  ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
})
export const disabledPointerNone = style({
  ':disabled': { pointerEvents: 'none', cursor: 'not-allowed' },
})

/** placeholder 状态 */
export const placeholderTextTertiary = style({
  '::placeholder': { color: 'var(--ant-color-text-tertiary)' },
})

// ============================================================
// 13. 主题切换（light / dark / brand / accent）
// ------------------------------------------------------------
// 提供 vanilla-extract 官方「主题」机制：
//   • themeContract —— 一组主题 token 声明（编译期类型安全的 vars）
//   • lightTheme / darkTheme —— 两套主题值，通过 `<div class={lightTheme}>` 切换
//   • brandTheme / accentTheme —— 可选的品牌主题（多主题场景）
//   • themeVars —— 把当前主题类名映射为 CSS 变量键值对
//
// 同时与已有的 `:root` / `html.dark` 选择器机制共存：
//   • 全局 dark mode：依旧靠 store 切换 <html class="dark"> + dynamicVars
//   • 局部主题覆盖：业务代码用 `<div class={darkTheme}>` 在子树内覆盖
//
// 用法：
//   import { themeContract, lightTheme, darkTheme, themeToVars } from '@/styles/utility.css'
//
//   // 方式 1：把 darkTheme 应用到子树
//   <section class={darkTheme}> ... </section>
//   // ↑ 该子树内 var(--theme-color) / var(--theme-bg) 走 dark 值
//
//   // 方式 2：动态切换
//   <section class={isDark ? darkTheme : lightTheme}> ... </section>
// ============================================================

import { createTheme, createThemeContract } from '@vanilla-extract/css'

/**
 * 主题 token 契约 —— 业务代码用 `vars.color` / `vars.bg` 引用主题色。
 * 编译期会展开为 `--theme-color__xxxxx` 等 CSS 变量。
 */
export const themeContract = createThemeContract({
  color: '主色',
  bg: '背景色',
  text: '文字主色',
  'text-secondary': '次要文字色',
  border: '边框色',
  success: '成功色',
  warning: '警告色',
  error: '错误色',
})

/**
 * Light 主题 —— 默认亮色调色板
 */
export const lightTheme = createTheme(themeContract, {
  color: '#1677ff',
  bg: '#ffffff',
  text: 'rgba(0, 0, 0, 0.88)',
  'text-secondary': 'rgba(0, 0, 0, 0.65)',
  border: '#d9d9d9',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
})

/**
 * Dark 主题 —— 暗色调色板
 */
export const darkTheme = createTheme(themeContract, {
  color: '#177ddc',
  bg: '#141414',
  text: 'rgba(255, 255, 255, 0.85)',
  'text-secondary': 'rgba(255, 255, 255, 0.65)',
  border: '#424242',
  success: '#49aa19',
  warning: '#d89614',
  error: '#dc4446',
})

/**
 * Brand 主题 —— 给 marketing 页面用（更鲜艳）
 */
export const brandTheme = createTheme(themeContract, {
  color: '#722ed1',
  bg: 'linear-gradient(135deg, #722ed1 0%, #1677ff 100%)',
  text: '#ffffff',
  'text-secondary': 'rgba(255, 255, 255, 0.75)',
  border: '#9254de',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
})

/**
 * Accent 主题 —— 给演示 / 内嵌卡片用（强调紫红）
 */
export const accentTheme = createTheme(themeContract, {
  color: '#eb2f96',
  bg: '#fff0f6',
  text: '#c41d7f',
  'text-secondary': '#eb2f96',
  border: '#ffadd2',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
})

/**
 * 主题集合 —— 业务代码遍历得到所有可用主题名 / className
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  brand: brandTheme,
  accent: accentTheme,
} as const

export type ThemeName = keyof typeof themes

/**
 * themeVars —— 已迁出到 @/styles/useTheme.ts
 * （运行时函数不允许从 .css.ts 导出）
 */

/** 引用主题 token 的预设 utility class —— 给「主题感知」组件用 */
export const themeColorPrimary = style({ color: themeContract.color })
export const themeBgPrimary = style({ backgroundColor: themeContract.bg })
export const themeBorderPrimary = style({ borderColor: themeContract.border })
export const themeTextPrimary = style({ color: themeContract.text })
export const themeTextSecondary = style({ color: themeContract['text-secondary'] })
export const themeSuccess = style({ color: themeContract.success })
export const themeWarning = style({ color: themeContract.warning })
export const themeError = style({ color: themeContract.error })

/** 主题感知按钮 —— 沿用主题色 */
export const themePrimaryBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: '0 calc(var(--space-unit) * 4)',
  height: 'calc(var(--space-unit) * 8)',
  borderRadius: 'var(--ant-border-radius)',
  backgroundColor: themeContract.color,
  borderColor: themeContract.color,
  color: '#fff',
  transition: 'all 0.2s',
  ':hover': { opacity: 0.85 },
})

/** 主题感知卡片 —— 沿用主题 bg + text */
export const themeCard = style({
  backgroundColor: themeContract.bg,
  color: themeContract.text,
  border: `1px solid ${themeContract.border}`,
  borderRadius: 'var(--ant-border-radius-lg)',
  padding: 'calc(var(--space-unit) * 5)',
})

/**
 * 主题注入 helper / detectActiveTheme 已迁出到 @/styles/useTheme.ts
 * （.css.ts 文件的 export 走 vanilla-extract AST 白名单，不允许运行时函数）。
 */

// ============================================================
// 14. 主题切换动画 —— 平滑过渡 dark ↔ light ↔ brand ↔ accent
// ------------------------------------------------------------
// 实现要点：
//   1. `--theme-transition` 控制过渡持续时间（默认 0ms，setTheme 调用时改为 350ms）
//   2. 只对「会受主题影响的属性」开过渡 —— background-color / color / border-color
//   3. setTheme 后下一帧清回 0ms，避免常驻 transition 拖慢其他动画
//   4. 首次加载页面主题已就绪，无动画（避免刷新看到颜色闪一下）
// ============================================================

/** 主题过渡持续时间变量 —— setTheme 时通过 CSS 变量临时改为非零值 */
const themeTransitionDuration = createVar()

globalStyle(':root', {
  vars: {
    [themeTransitionDuration]: '0ms',
  },
})

/**
 * 默认主题过渡样式：受主题影响的属性走 `var(--theme-transition)` 时长。
 * 由 vanilla-extract 的全局选择器应用到全部元素。
 */
globalStyle('*', {
  transitionDuration: 'var(--theme-transition)',
  transitionProperty: 'background-color, color, border-color, fill, stroke',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
})

/**
 * `themeTransitioning` —— 在 setTheme 调用瞬间挂在 <html> 上，过渡结束后移除。
 * 业务代码通常不需要直接用，由 setTheme 内部自动加/清。
 */
export const themeTransitioning = style({})

/**
 * 在动画时段内启用过渡 —— 通过修改 --theme-transition 控制时长。
 * 由 useTheme.setTheme() 在浏览器 raf 中临时加/清。
 */
globalStyle(`.${themeTransitioning}`, {
  vars: {
    [themeTransitionDuration]: '350ms',
  },
})

/** 主题感知过渡 class —— 可选主题快 / 慢 */
export const themeTransitionFast = style({
  transitionDuration: '150ms',
  transitionProperty: 'background-color, color, border-color, fill, stroke',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
})
export const themeTransitionSlow = style({
  transitionDuration: '500ms',
  transitionProperty: 'background-color, color, border-color, fill, stroke',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
})

/** 关闭过渡（给「立即切换」的场景用） */
export const themeTransitionNone = style({
  transition: 'none !important',
})

/**
 * `@view-transition` 支持 —— 浏览器原生主题切换动画。
 * 注：当前兼容性有限（Chrome 111+ / Edge 111+），作为可选增强。
 *
 * 业务方使用：在 main.tsx 的 `<html>` / `<body>` 上加 `style="view-transition-name: root"`
 * 然后调用 `document.startViewTransition(() => setTheme('dark'))` 即可触发。
 */
globalStyle('::view-transition-old(root), ::view-transition-new(root)', {
  animationDuration: '350ms',
})
globalStyle('::view-transition-old(root)', {
  animationName: 'vanillaExtractThemeFadeOut',
})
globalStyle('::view-transition-new(root)', {
  animationName: 'vanillaExtractThemeFadeIn',
})

/**
 * 主题过渡缓动变量 —— 业务可定制（默认 Material easing）。
 */
const themeTransitionEasing = createVar()
globalStyle(':root', {
  vars: {
    [themeTransitionEasing]: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
})

/**
 * 自定义主题过渡时长 / 缓动 —— 通过这两个 var 控制全局。
 * 当 themeTransitioning 挂载时，时长 = var(--theme-transition-duration)
 * 缓动 = var(--theme-transition-easing)。
 */
globalStyle(`.${themeTransitioning}`, {
  vars: {
    [themeTransitionDuration]: '350ms',
    [themeTransitionEasing]: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
})

/**
 * 主题切换瞬间的"轻微 fade"动画 —— 给 <body> 加 200ms 的轻微透明渐变。
 * 业务方不需要主动使用，由 setTheme 在 html 上挂 themeFadeIn。
 */
export const themeFadeIn = keyframes({
  from: { opacity: 0.6 },
  to: { opacity: 1 },
})
export const themeFadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0.7 },
})

/** @view-transition keyframes —— 用于上面 view-transition-name 触发的整页动画 */
const viewTransitionFadeOutKf = keyframes({
  to: { opacity: 0 },
})
const viewTransitionFadeInKf = keyframes({
  from: { opacity: 0 },
})
globalStyle('::view-transition-old(root)', {
  animationName: viewTransitionFadeOutKf,
})
globalStyle('::view-transition-new(root)', {
  animationName: viewTransitionFadeInKf,
})

/**
 * themeFadePulse —— 在 setTheme 时挂在 <body> 上的轻量淡入。
 * 提供「切换瞬间颜色略淡再恢复」的细节感（200ms）。
 */
export const themeFadePulse = style({
  animationName: themeFadeIn,
  animationDuration: '200ms',
  animationTimingFunction: 'ease-out',
})

/**
 * `prefers-reduced-motion: reduce` 适配 —— 用户系统级关闭动效时，
 * 把全局主题过渡时长压到 0ms，不影响 setTheme 的视觉切换。
 *
 * 注：vanilla-extract 不支持 `@media` selector 与 vars 字段直混，
 * 这里用 media query 包在 vars 外层。lightningcss minify 兼容此写法。
 */
globalStyle(':root', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      vars: {
        [themeTransitionDuration]: '0ms',
      },
    },
  },
})

/**
 * Sun / Moon 主题切换按钮动画 —— 给 <button class={themeIconSpin}> 元素 500ms 转一圈。
 */
export const themeIconSpin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})
export const themeIconRotate = style({
  animationName: themeIconSpin,
  animationDuration: '500ms',
  animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
})

/**
 * 主题图标淡入 + 缩放（给「双图标切换」的太阳 / 月亮按钮用）。
 */
export const themeIconFadeScale = keyframes({
  from: { opacity: 0, transform: 'scale(0.5) rotate(-90deg)' },
  to: { opacity: 1, transform: 'scale(1) rotate(0deg)' },
})
export const themeIconAppear = style({
  animationName: themeIconFadeScale,
  animationDuration: '300ms',
  animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
})

/**
 * themeRipple —— 主题切换时给一个圆形扩散效果（从按钮点击位置发散）。
 * 业务方调用 setTheme 时传入 `{ ripple: true }` 启用。
 */
const rippleSize = createVar()
globalStyle(':root', {
  vars: {
    [rippleSize]: '1200px', // 足够大覆盖全屏
  },
})
export const themeRipple = keyframes({
  from: { clipPath: 'circle(0px at var(--theme-ripple-x, 50%) var(--theme-ripple-y, 50%))' },
  to: { clipPath: `circle(var(--theme-ripple-size, ${rippleSize}) at var(--theme-ripple-x, 50%) var(--theme-ripple-y, 50%))` },
})
// ripple 通过 setViewTransition 集成更复杂；这里只提供 keyframes 备用

/**
 * `themeMorphBg` —— 主题切换时让 bg-color 走更明显的 morph（曲线 + 颜色同时变）。
 */
export const themeMorphKeyframes = keyframes({
  '0%': { backgroundColor: 'transparent' },
  '50%': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
  '100%': { backgroundColor: 'transparent' },
})
export const themeMorph = style({
  animationName: themeMorphKeyframes,
  animationDuration: '500ms',
  animationTimingFunction: 'ease-in-out',
})

/**
 * 主题切换的「闪烁指示」 —— 整页半透明黑色遮罩淡入淡出，给用户
 * 「切了」的感觉。给 body 一个 100ms 的 mask 闪烁。
 */
const themeFlashKeyframes = keyframes({
  '0%, 100%': { backgroundColor: 'transparent' },
  '50%': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
})
export const themeFlash = style({
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 9999,
  animationName: themeFlashKeyframes,
  animationDuration: '200ms',
})

/**
 * antd 令牌过渡 —— 把 `--ant-color-*` 系列 CSS 变量也纳入主题过渡。
 * 切换 `<html class="dark">` 时，所有引用 antd 令牌的元素
 * （background-color / color / border-color）会自动平滑切换。
 *
 * 注：Element Plus 组件内部的颜色变量（`--el-color-*`）是通过 `:root`
 * 选择器定义的，dark 时切换不会触发 transition —— 这不影响，故选 dark。
 */
globalStyle(`.${themeTransitioning} *`, {
  transitionDuration: 'var(--theme-transition-duration, 350ms)',
  transitionProperty:
    'background-color, color, border-color, fill, stroke, box-shadow',
  transitionTimingFunction: 'var(--theme-transition-easing, cubic-bezier(0.4, 0, 0.2, 1))',
})

/**
 * `themeSwitchExpand` —— 切换瞬间 body 从中心圆形展开。
 * 类似 Material You 的"圆形 reveal"，覆盖整页。
 *
 * 用法：setTheme({ animate: 'expand' }) —— 自动挂在 <body> 上 600ms 后移除。
 */
const themeSwitchExpandKeyframes = keyframes({
  from: {
    clipPath: 'circle(0% at var(--theme-ripple-x, 50%) var(--theme-ripple-y, 50%))',
  },
  to: {
    clipPath: 'circle(150% at var(--theme-ripple-x, 50%) var(--theme-ripple-y, 50%))',
  },
})
export const themeSwitchExpand = style({
  animationName: themeSwitchExpandKeyframes,
  animationDuration: '600ms',
  animationTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
})

/**
 * `themeSwitchBlur` —— 切换瞬间让整页模糊 → 清晰。
 * 给 "切换瞬间失去焦点" 的高级感。配合 themeSwitchExpand 使用效果更佳。
 */
const themeSwitchBlurKeyframes = keyframes({
  from: { filter: 'blur(8px)', opacity: 0.7 },
  to: { filter: 'blur(0)', opacity: 1 },
})
export const themeSwitchBlur = style({
  animationName: themeSwitchBlurKeyframes,
  animationDuration: '400ms',
  animationTimingFunction: 'ease-out',
})

/**
 * `themeSwitchScale` —— 切换瞬间整页轻微缩放 + 还原。
 */
const themeSwitchScaleKeyframes = keyframes({
  from: { transform: 'scale(0.98)', opacity: 0.85 },
  to: { transform: 'scale(1)', opacity: 1 },
})
export const themeSwitchScale = style({
  animationName: themeSwitchScaleKeyframes,
  animationDuration: '350ms',
  animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
})

/**
 * `themeSwitchSlide` —— 切换瞬间整页水平/垂直滑出再滑入。
 * 类似移动端 navigation theme transition。
 */
const themeSwitchSlideKeyframes = keyframes({
  from: { transform: 'translateY(12px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
})
export const themeSwitchSlide = style({
  animationName: themeSwitchSlideKeyframes,
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
})

/**
 * `themeShimmer` —— 切换瞬间整页金色光带扫过（高光感）。
 * 类似 Apple iOS 切换主题时的 shimmer 效果。
 */
const themeShimmerKeyframes = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
})
export const themeShimmer = style({
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 9998,
  backgroundImage:
    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
  backgroundRepeat: 'no-repeat',
  animationName: themeShimmerKeyframes,
  animationDuration: '700ms',
  animationTimingFunction: 'ease-in-out',
})

/**
 * `themeColorMatrix` —— 切换瞬间整页色调临时偏移（绿色 / 紫色），给
 * 「主题换骨」的视觉冲击。适合 brand / accent 主题。
 */
const themeColorMatrixKeyframes = keyframes({
  '0%': { filter: 'hue-rotate(0deg)' },
  '50%': { filter: 'hue-rotate(30deg)' },
  '100%': { filter: 'hue-rotate(0deg)' },
})
export const themeColorMatrix = style({
  animationName: themeColorMatrixKeyframes,
  animationDuration: '500ms',
  animationTimingFunction: 'ease-in-out',
})

/** 主题切换动画预设集合 —— 业务方遍历可选 */
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
export type ThemeAnimationName = keyof typeof themeAnimations