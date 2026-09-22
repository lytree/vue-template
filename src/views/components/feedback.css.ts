/** Components Feedback 私有样式 */
import { style } from '@vanilla-extract/css'

export const alertStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
})

export const loadingBoxStyle = style({
  marginTop: 16,
  display: 'flex',
  height: 96,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ant-border-radius)',
  border: '1px solid var(--ant-color-border-secondary)',
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary)',
})

export const noteText = style({
  marginTop: 12,
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary)',
})

export const noteCode = style({
  backgroundColor: 'var(--ant-color-fill-tertiary)',
  padding: '1px 6px',
  borderRadius: 4,
  fontFamily: "'SFMono-Regular', Consolas, monospace",
  fontSize: 13,
})

export const dialogFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
})

export const textSmSecondary = style({
  fontSize: 14,
  color: 'var(--ant-color-text-secondary)',
})

export const popoverText = style({
  fontSize: 14,
})

export const tourAnchors = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
})

export const tourAnchor = style({
  borderRadius: 'var(--ant-border-radius)',
  border: '1px dashed var(--ant-color-border)',
  padding: '8px 16px',
  fontSize: 14,
})

export const resultRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
})
