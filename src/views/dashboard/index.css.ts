/** Dashboard 私有样式 */
import { style } from '@vanilla-extract/css'

// 趋势箭头图标（父 .group hover 时跟随变色）
export const arrowIcon = style({
  flexShrink: 0,
  color: 'var(--ant-color-text-quaternary)',
  transition: 'color 0.15s',
  selectors: {
    '.group:hover &': {
      color: 'var(--ant-color-primary)',
    },
  },
})

// 趋势标题行
export const trendHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderTop: '1px solid var(--ant-color-border-secondary)',
  paddingTop: 16,
  marginTop: 24,
})

export const trendLegend = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary)',
})

export const trendLegendItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
})

// 柱子容器
export const barRow = style({
  marginTop: 16,
  display: 'flex',
  height: 128,
  alignItems: 'flex-end',
  gap: 8,
})

export const activityList = style({
  marginTop: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

export const activityItem = style({
  display: 'flex',
  gap: 12,
})
