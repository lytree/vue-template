/**
 * 工具类（替代 Tailwind utility classes）
 *
 * 设计原则：
 * 1. 每个 utility 都是 vanilla-extract `style()`，编译时产出唯一的 hashed 类名
 * 2. 通过 `class={\`${utilA} ${utilB}\`}` 组合使用（多个 vanilla-extract 类名共存，无冲突）
 * 3. 所有 token 走 CSS 变量（var(--ant-color-*)），dark mode 跟随 <html class="dark">
 *
 * 命名约定：沿用 Tailwind 命名（flex / flex-col / gap-4 / p-5 等），
 * 让从 Tailwind 切换过来几乎没有心智负担。
 *
 * —— 与 Linaria utility.tsx 区别 ——
 * • vanilla-extract 的 style() 返回 hashed class name（一行一种样式）
 * • 数字直接传 number（如 padding: 16），vanilla-extract 自动加 'px'
 * • 复杂选择器（`&:hover`、`.group:hover &`、@media）放进对象：`':hover': {...}`、`'@media': {...}`
 */
import { globalStyle, style } from '@vanilla-extract/css'

// ============================================================
// 1. display / flex / grid
// ============================================================
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

// ============================================================
// 2. gap
// ============================================================
export const gap1 = style({ gap: 4 })
export const gap2 = style({ gap: 8 })
export const gap3 = style({ gap: 12 })
export const gap4 = style({ gap: 16 })
export const gap6 = style({ gap: 24 })

export const gapX3 = style({ columnGap: 12 })
export const gapX8 = style({ columnGap: 32 })
export const gapY0 = style({ rowGap: 0 })
export const gapY3 = style({ rowGap: 12 })

// ============================================================
// 3. grid columns
// ============================================================
export const gridCols1 = style({ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' })
export const gridCols2 = style({ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' })
export const gridCols3 = style({ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' })
export const gridCols4 = style({ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' })

export const xlColSpan2 = style({
  '@media': {
    'screen and (min-width: 1280px)': {
      gridColumn: 'span 2 / span 2',
    },
  },
})

// ============================================================
// 4. width / height
// ============================================================
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

// ============================================================
// 5. padding
// ============================================================
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

// ============================================================
// 6. margin
// ============================================================
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

// ============================================================
// 7. typography
// ============================================================
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

// ============================================================
// 8. color
// ============================================================
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

// dark mode variants
export const darkBgGreenDark = style({
  selectors: {
    '.dark &': { backgroundColor: '#162312' },
  },
})
export const darkBgYellowDark = style({
  selectors: {
    '.dark &': { backgroundColor: '#2b2111' },
  },
})
export const darkBgRedDark = style({
  selectors: {
    '.dark &': { backgroundColor: '#2c1618' },
  },
})

// 父元素加 .group 后，子元素的 group-hover:* 才会触发
// （vanilla-extract 不需要样式，只是个标记 class —— 元素加 `${group}` 即可）
export const group = style({})

/** group-hover: 文本/图标色跟随父元素 .group 的 hover 状态 */
export const groupHoverTextPrimary = style({
  selectors: {
    '.group:hover &': {
      color: 'var(--ant-color-primary)',
    },
  },
})

// ============================================================
// 9. border
// ============================================================
export const border = style({ border: '1px solid var(--ant-color-border)' })
export const borderSecondary = style({ border: '1px solid var(--ant-color-border-secondary)' })
export const borderB = style({ borderBottom: '1px solid var(--ant-color-border-secondary)' })
export const borderT = style({ borderTop: '1px solid var(--ant-color-border-secondary)' })
export const borderR = style({ borderRight: '1px solid var(--ant-color-border-secondary)' })
export const borderPrimary = style({ border: '1px solid var(--ant-color-primary)' })
export const borderPrimaryBorder = style({ border: '1px solid var(--ant-color-primary-border)' })
export const borderNone = style({ border: 'none' })
export const borderAntdPrimary = style({ border: '1px solid var(--el-color-primary)' })

// ============================================================
// 10. radius
// ============================================================
export const rounded = style({ borderRadius: 'var(--ant-border-radius)' })
export const roundedSm = style({ borderRadius: 'var(--ant-border-radius-sm)' })
export const roundedMd = style({ borderRadius: 'var(--ant-border-radius)' })
export const roundedLg = style({ borderRadius: 'var(--ant-border-radius-lg)' })
export const roundedFull = style({ borderRadius: 9999 })
export const roundedT3 = style({
  borderTopLeftRadius: 3,
  borderTopRightRadius: 3,
})

// ============================================================
// 11. divide
// ============================================================
export const divideY = style({})

globalStyle(`${divideY} > :not([hidden]) ~ :not([hidden])`, {
  borderTop: '1px solid var(--ant-color-border-secondary)',
})

// ============================================================
// 12. shadow
// ============================================================
export const shadowAntd = style({ boxShadow: 'var(--ant-box-shadow)' })
export const shadowAntdLg = style({ boxShadow: 'var(--ant-box-shadow-secondary)' })

// ============================================================
// 13. transition / overflow / cursor / truncate
// ============================================================
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

// ============================================================
// 14. position / z-index
// ============================================================
export const relative = style({ position: 'relative' })
export const absolute = style({ position: 'absolute' })
export const sticky = style({ position: 'sticky' })
export const fixed = style({ position: 'fixed' })

// ============================================================
// 15. 复合快捷类
// ============================================================
/** flex column + gap: 16px —— 最常用的「竖向堆叠」 */
export const stackCol = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

/** flex + items-center + gap: 8px —— 「行内图标 + 文字」 */
export const inlineRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
})

/** 完美居中 */
export const center = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

/** antd 风格卡片 */
export const appCard = style({
  backgroundColor: 'var(--ant-color-bg-container)',
  border: '1px solid var(--ant-color-border-secondary)',
  borderRadius: 'var(--ant-border-radius-lg)',
  boxShadow: 'var(--ant-box-shadow)',
})

/** antd 卡片可悬停态 */
export const appCardHoverable = style({
  transition: 'box-shadow 0.2s, border-color 0.2s',
  ':hover': {
    borderColor: 'var(--ant-color-primary-border)',
    boxShadow: 'var(--ant-box-shadow-secondary)',
  },
})

/** antd 主色按钮 */
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

/** 侧边栏图标按钮 */
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

/** 用户头像下拉触发器 */
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

/** 顶部栏 logo 块 */
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

/** antd 风格快捷入口卡片 */
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

/** 仪表盘柱子（趋势图） */
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

/** 动态时间线圆点 */
export const activityDot = style({
  marginTop: 6,
  width: 6,
  height: 6,
  flexShrink: 0,
  borderRadius: 9999,
  backgroundColor: 'var(--ant-color-primary)',
})

/** 上升/下降色块 */
export const trendUp = style({ color: '#ff4d4f' })
export const trendDown = style({ color: '#52c41a' })

/** !important 变体 —— 用于压过 Element Plus 内置样式 */
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

// dashed border
export const borderDashed = style({
  borderStyle: 'dashed',
  borderColor: 'var(--ant-color-border)',
})
export const borderDashedPrimary = style({
  borderStyle: 'dashed',
  borderColor: 'var(--ant-color-primary)',
})

// hover 工具
export const hoverBorderPrimary = style({
  ':hover': { borderColor: 'var(--ant-color-primary)' },
})
export const hoverBorderPrimaryBorder = style({
  ':hover': { borderColor: 'var(--ant-color-primary-border)' },
})
export const hoverTextPrimary = style({
  ':hover': { color: 'var(--ant-color-primary)' },
})

// ============================================================
// 16. 响应式
// ============================================================
export const smGridCols2 = style({
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
})
export const smGridCols3 = style({
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
})
export const smFlexRow = style({
  '@media': {
    'screen and (min-width: 640px)': { flexDirection: 'row' },
  },
})
export const xlGridCols3 = style({
  '@media': {
    'screen and (min-width: 1280px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
})
export const xlGridCols4 = style({
  '@media': {
    'screen and (min-width: 1280px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  },
})
export const smBlock = style({
  '@media': {
    'screen and (min-width: 640px)': { display: 'block' },
  },
})
export const maxW3xl = style({ maxWidth: 768 })
export const maxWmd = style({ maxWidth: 448 })
export const maxWxl = style({ maxWidth: 576 })
