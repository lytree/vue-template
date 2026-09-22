/** Components Data 私有样式 */
import { style } from '@vanilla-extract/css'

// 通用尺寸预设
export const badgeSlot = style({
  display: 'flex',
  width: 40,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  backgroundColor: 'var(--ant-color-fill-tertiary)',
  fontSize: 14,
})

export const progressWrap = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  gap: 16,
})

export const progressCircleRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 24,
})

export const skeletonRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
})

export const skeletonInline = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
})

export const skeletonTextCol = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  gap: 8,
})

export const carousel = style({
  width: '100%',
  maxWidth: 576,
  borderRadius: 'var(--ant-border-radius)',
})

export const carouselSlide = style({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  color: '#fff',
})

export const imageGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 16,
})

export const maxWmd = style({ maxWidth: 448 })
export const maxWxl = style({ maxWidth: 576 })

export const treeV2Box = style({
  maxWidth: 448,
  overflow: 'hidden',
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
})

export const cardRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
})

export const cardSmall = style({ width: 256 })

export const cardBody = style({
  fontSize: 14,
  color: 'var(--ant-color-text-secondary)',
})

export const cardHeader = style({ fontWeight: 500 })

export const avatarPrimary = style({
  backgroundColor: 'var(--ant-color-primary)',
  color: '#fff',
})

export const avatarSuccess = style({
  backgroundColor: 'var(--ant-color-success)',
  color: '#fff',
})

export const textSmSecondary = style({
  fontSize: 14,
  color: 'var(--ant-color-text-secondary)',
})

export const countdown = style({
  fontSize: 18,
  fontWeight: 500,
})

export const calendarBox = style({ maxWidth: 768 })

export const calendarDay = style({
  textAlign: 'center',
  fontSize: 12,
})
