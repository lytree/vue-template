/** Components Navigation 私有样式 */
import { style } from '@vanilla-extract/css'

// 菜单容器
export const menuBox = style({
  width: 240,
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
})

// 标签页栈
export const tabStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
})

// 标签页主体
export const tabsBox = style({
  maxWidth: 576,
})

export const tabPaneText = style({
  fontSize: 14,
  color: 'var(--ant-color-text-secondary)',
})

export const breadcrumbStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

export const dropdownArrow = style({
  marginLeft: 4,
})

export const stepsStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
})

export const stepsBox = style({
  maxWidth: 672,
})

export const backtopScope = style({
  position: 'relative',
  height: 160,
  overflowY: 'auto',
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
})

export const backtopList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 12,
  fontSize: 14,
})

export const backtopItem = style({
  borderRadius: 'var(--ant-border-radius-sm)',
  backgroundColor: 'var(--ant-color-fill-quaternary)',
  padding: '6px 12px',
})

export const anchorScope = style({
  position: 'relative',
  height: 256,
  overflowY: 'auto',
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
})

export const anchorLayout = style({
  display: 'flex',
  gap: 24,
  padding: 16,
})

export const anchorMain = style({
  minWidth: 0,
  flex: '1 1 0%',
})

export const anchorTarget = style({
  marginBottom: 12,
  display: 'flex',
  height: 144,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  backgroundColor: 'var(--ant-color-fill-quaternary)',
  fontSize: 14,
})
